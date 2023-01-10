$('#email-form').submit(function (e) {
    e.preventDefault();
    document.getElementById("overlay").style.display = "flex";
    $.ajax({
        url: 'https://us-central1-dreamkasper-website.cloudfunctions.net/app/user/save-feedback',
        type: 'post',
        data: $(e.target).serialize(),
        success: function () {
            document.getElementById("overlay").style.display = "none";
            e.target.reset();
            Swal.fire({
                title: 'Thank you!',
                text: 'We will get back to you',
                icon: 'success',
                confirmButtonColor: '#04599c',
            })
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            document.getElementById("overlay").style.display = "none";
            Swal.fire({
                title: 'Apologies!',
                text: 'Can you contact us manually on admin@dreamkasper.com',
                icon: 'error',
                confirmButtonColor: '#04599c',
            })

        }
    });
});