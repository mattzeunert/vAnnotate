function initializeAnnotations(){
    var annotationElement = $('<div>')
        .addClass('annotation')
        .hide()
        .appendTo('body');

    $('.annotated-element').on('mouseenter', function(){
        // Use attr rather than data to avoid parsing of strings like 'false' or '[]'
        var annotationValue = $(this).attr('data-annotation-value');
        annotationElement.html(annotationValue);

        var top, left;
        top = $(this).offset().top - annotationElement.height() - 6;
        if (top < 0){
            top = $(this).offset().top + 20;
        }
        left = $(this).offset().left;

        annotationElement.css({
            top: top,
            left: left
        })
        annotationElement.show();
    });

    $('.annotated-element').on('mouseleave', function(){
        annotationElement.hide();
    });
}
