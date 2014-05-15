function initializeAnnotations(results){
    var annotationElement = $('<div>')
        .addClass('annotation')
        .hide()
        .appendTo('body');

    $('.annotated-element').on('mouseenter', function(){
        var el = this;

        var annotationIndex = $(el).data('annotationIndex');
        // On the Github overlay annotations can cover
        // multiple spans, only the first one has all the
        var allAnnotationElements = $('.js-annotation-index-' + annotationIndex);
        el = allAnnotationElements[0];
        allAnnotationElements.addClass('hover');

        // Use attr rather than data to avoid parsing of strings like 'false' or '[]'
        if (results[annotationIndex]) {
            var result = results[annotationIndex];
            var lines = result.split('\n');
            var content = '';
            var title = '';
            if (lines.length == 1){
                content = formatAndEscapeString(result);
            }
            else {
                title = lines.shift();
                content = lines.join('\n').trim();
            }

            function formatAndEscapeString(str){
                return htmlEscapeQuotes(str).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
            }

            title = formatAndEscapeString(title);
            content = formatAndEscapeString(content);
            var html = (title ? '<div class="title">' + title + '</div>' : '') + '<div class="content">' + content + '</div>';
            annotationElement.html(html);

            var top, left;
            top = $(el).offset().top - annotationElement.height() - 10;
            if (top < 0){
                top = $(el).offset().top + 20;
            }
            left = $(el).offset().left;

            annotationElement.css({
                top: top,
                left: left
            });
            annotationElement.show();
        }
    });

    $('.annotated-element').on('mouseleave', function(){
        annotationElement.hide();
        var el = this;
        var annotationIndex = $(el).data('annotationIndex');
        var allAnnotationElements = $('.js-annotation-index-' + annotationIndex);
        allAnnotationElements.removeClass('hover');
    });
}
