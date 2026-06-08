from django import forms
from django.apps import apps
from django.utils import timezone
from index.models import Staff
from .models import EndOfDayTakings, Receipts
from decimal import Decimal


class ReceiptsForm(forms.ModelForm):
    class Meta:
        model = Receipts
        fields = ['name', 'description', 'value', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control form-control-sm', 'placeholder': 'e.g., Supplier Invoice, Petty Cash'}),
            'description': forms.Textarea(attrs={'class': 'form-control form-control-sm', 'rows': 1, 'placeholder': 'Optional details...'}),
            'value': forms.NumberInput(attrs={'class': 'form-control form-control-sm', 'step': '0.01', 'value': '0.00'}),
            
            # --- FIXED WIDGET: EMPOWERS THE TABLET OS TO SHOW THE CHOICE MENU ---
            'image': forms.ClearableFileInput(attrs={
                'class': 'form-control form-control-sm',
                'accept': 'image/*'  # Restricts files to images, triggering the native OS choice prompt
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].required = False
        self.fields['value'].required = False
        self.fields['image'].required = False



class EndOfDayTakingsForm(forms.ModelForm):
    class Meta:
        model = EndOfDayTakings
        exclude = ['submission_date', 'total_value']
        widgets = {
            'trading_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'submitted_by': forms.Select(attrs={'class': 'form-control'}),
            'receipts': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
         # 1. Fetch current local date
        today_str = timezone.localtime(timezone.now()).date().isoformat()
        
        # 2. Assign dynamic HTML date constraints (max allows today and earlier only)
        self.fields['trading_date'] = forms.DateField(
            widget=forms.DateInput(attrs={
                'type': 'date', 
                'class': 'form-control',
                'max': today_str  # <-- Blurs out and blocks future dates on the calendar
            })
        )

        # 3. Safe dynamic loading of Staff relationships
        StaffModel = apps.get_model('index', 'Staff')
        self.fields['submitted_by'] = forms.ModelChoiceField(
            queryset=StaffModel.objects.all(),
            required=True,
            widget=forms.Select(attrs={'class': 'form-control'}),
            label="Staff Member"
        )

        # Apply clean classes to all numeric input boxes
        for field_name, field in self.fields.items():
            if isinstance(field, (forms.IntegerField, forms.DecimalField)) and field_name != 'trading_date':
                field.widget.attrs.update({
                    'class': 'form-control',
                    'min': '0',
                    'value': '0'
                })

    def clean_trading_date(self):
        """
        Backend safety filter: Throws an alert message if a user attempts 
        to submit a manual entry for a future date.
        """
        trading_date = self.cleaned_data.get('trading_date')
        today = timezone.localtime(timezone.now()).date()
        
        if trading_date and trading_date > today:
            raise forms.ValidationError("Trading date cannot be in the future.")
            
        return trading_date
    
    def clean(self):
        """
        Backend integrity loop: Checks that provided cash values are mathematically 
        possible for their respective denominations. Zero values are now fully allowed.
        """
        cleaned_data = super().clean()

        # Define the structural map of fields matching your frontend data-multipliers
        denominations = {
            'one_cent_value': Decimal('0.01'),
            'two_cent_value': Decimal('0.02'),
            'five_cent_value': Decimal('0.05'),
            'ten_cent_value': Decimal('0.10'),
            'twenty_cent_value': Decimal('0.20'),
            'fifty_cent_value': Decimal('0.50'),
            'one_euro_value': Decimal('1.00'),
            'two_euro_value': Decimal('2.00'),
            'five_euro_value': Decimal('5.00'),
            'ten_euro_value': Decimal('10.00'),
            'twenty_euro_value': Decimal('20.00'),
            'fifty_euro_value': Decimal('50.00'),
            'one_hundred_euro_value': Decimal('100.00'),
            'two_hundred_euro_value': Decimal('200.00'),
        }

        for value_field, multiplier in denominations.items():
            value = cleaned_data.get(value_field)
            
            if value is not None and value > 0:
                # Check for an impossible amount remainder
                if value % multiplier != 0:
                    readable_name = value_field.replace('_value', '').replace('_', ' ').title()
                    
                    self.add_error(
                        value_field, 
                        forms.ValidationError(
                            f"Impossible value for {readable_name}. Must be a multiple of €{multiplier}."
                        )
                    )

        # The block checking for zero cash and vouchers has been removed.
        return cleaned_data