var Lightbox = {

    slideIndex: 1,

    // Open the Modal
    openModal: function() {
        $("#myModal").css({ 'display': 'block' });
    },

    // Close the Modal
    closeModal: function() {
        $("#myModal").css({ 'display': 'none' });
    },

    openAndShow: function (e) {
        Lightbox.openModal();        
        Lightbox.currentSlide($(e.currentTarget).data('slide'));
    },

    // Next/previous controls
    plusSlides: function (n) {
        Lightbox.showSlides(Lightbox.slideIndex += n);
    },

    prevSlide: function () {
        Lightbox.plusSlides(-1);
    },

    nextSlide: function () {
        Lightbox.plusSlides(1);
    },

    // Thumbnail image controls
    currentSlide: function (n) {
        Lightbox.showSlides(Lightbox.slideIndex = n);
    },

    showSlides: function (n) {
        var slides = $(".mySlides");
        if (n > slides.length) { Lightbox.slideIndex = 1 }
        if (n < 1) { Lightbox.slideIndex = slides.length }        
        slides.css({ 'display': 'none' });
        $(slides[Lightbox.slideIndex - 1]).css({ 'display': 'block' });
    }

};