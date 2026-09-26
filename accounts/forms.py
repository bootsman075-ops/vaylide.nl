from django import forms


class EmailForm(forms.Form):
    email = forms.EmailField(
        label="Je e-mailadres",
        max_length=254,
        error_messages={"required": "Vul je e-mailadres in.", "invalid": "Vul een geldig e-mailadres in."},
        widget=forms.EmailInput(attrs={"autocomplete": "email", "inputmode": "email", "autofocus": True}),
    )


class CodeForm(forms.Form):
    code = forms.CharField(
        label="Code uit de e-mail",
        max_length=12,
        error_messages={"required": "Vul de code in."},
        widget=forms.TextInput(attrs={"autocomplete": "one-time-code", "inputmode": "numeric", "pattern": "[0-9 ]*", "autofocus": True}),
    )

    def clean_code(self):
        code = "".join(ch for ch in self.cleaned_data["code"] if ch.isdigit())
        if len(code) != 6:
            raise forms.ValidationError("De code bestaat uit 6 cijfers.")
        return code
