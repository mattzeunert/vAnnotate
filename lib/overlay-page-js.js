function initializeAnnotations(results){
    function createAnnotationBubble(annotationElement){
        var annotationBubble = $('<div>')
            .addClass('annotation')
            .hide()
            .appendTo('body');

        $(annotationElement).data('cursorIsInsideAnnotationBubble', false)
        annotationBubble.on('mouseenter', function(){
            console.log('bubble mouseenter')
            $(annotationElement).data('cursorIsInsideAnnotationBubble', true)
        })
        annotationBubble.on('mouseleave', function(){
            console.log('bubble mouseleave')
            $(annotationElement).data('cursorIsInsideAnnotationBubble', false)
            $(this).hide();
        })
        return annotationBubble;
    }

    var currentAnnotationIndex;
    $('.annotated-element').on('mouseenter', function(){
        var el = this;
        var annotationIndex = $(el).data('annotationIndex');
        showAnnotation(annotationIndex)
    });


    var showAnnotation = function(annotationIndex){
        currentAnnotationIndex =annotationIndex;
        // On the Github overlay annotations can cover
        // multiple spans, only the first one has all the
        var allAnnotationElements = $('.js-annotation-index-' + annotationIndex);
        el = allAnnotationElements[0];
        allAnnotationElements.addClass('hover');

        var result = results[annotationIndex]
        if (result===undefined){
            result = 'No annotation is available for this variable... it might not have been used during logging.'
        }

        var content = '';
        var title = '';

        if (typeof result === 'string'){
            var lines = result.split('\n');
            if (lines.length == 1){
                content = formatAndEscapeString(result);
            }
            else {
                title = lines.shift();
                content = lines.join('\n').trim();
            }
        }
        else {
            title = 'Array[' + result.length + ']';

            var compactView = '[' + result.items.join(', ') + ']';
            if (compactView.length <= 20){
                content = compactView;
            }
            else {
                var multiLineView = '[';
                multiLineView += result.items.join(',\n');
                multiLineView += ']';
                content = multiLineView;
            }
        }

        function formatAndEscapeString(str){
            return htmlEscapeQuotes(str).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
        }

        title = formatAndEscapeString(title);
        content = formatAndEscapeString(content);
        var html = (title ? '<div class="title">' + title + '</div>' : '') + '<div class="content">' + content + '</div>';
        var annotationBubble = createAnnotationBubble(el);
        $(el).data('annotationBubble', annotationBubble)
        annotationBubble.html(html);

        var top, left;
        top = $(el).offset().top - annotationBubble.height() - 10;
        if (top < 0){
            top = $(el).offset().top + 20;
        }
        left = $(el).offset().left;

        annotationBubble.css({
            top: top,
            left: left
        });
        annotationBubble.show();

    }

    $('.annotated-element').on('mouseleave', function(){
        var el = this;
        var annotationIndex = $(el).data('annotationIndex');
        var allAnnotationElements = $('.js-annotation-index-' + annotationIndex);
        var firstEl = allAnnotationElements[0];
        allAnnotationElements.removeClass('hover');
        setTimeout(function(){
            if ($(firstEl).data('cursorIsInsideAnnotationBubble')){return;}
            $(firstEl).data('annotation-bubble').hide();
        }, 100)
    });
}



function htmlEscapeQuotes(str){
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#39;');
    return str;
}

function stripNonAsciiCharacters(str){
    return str.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
}
