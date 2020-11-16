// Disable form submissions if there are invalid fields
(function () {
    'use strict';

    bsCustomFileInput.init();

    // Fetch all forms custom Bootstrap validation styles should be applied to
    const forms = document.querySelectorAll('.validated-form');

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add('was-validated');
            }, false);
        });
})();