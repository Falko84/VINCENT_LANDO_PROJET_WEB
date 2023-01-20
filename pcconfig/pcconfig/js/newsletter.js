function formSubscribe(){
    $(document).on('submit', '#suscribeNewsletter', function (e) {
        e.preventDefault();
        var $this = $(this);
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: new FormData($this[0]),
            processData: false,
            contentType: false,
            statusCode: {
                200: function (response) {
                    $('#suscribeNewsletter').replaceWith(response.formContent);
                    $('#modal-newsletter').modal('show');
                    $("#modal-newsletter .modal-content").replaceWith(response.modalContent);
                },
                400: function (response) {
                    $('#suscribeNewsletter').replaceWith(response.responseJSON.formContent);
                }
            }
        });
    });
}
$(document).ready(function () {
    formSubscribe();
});
