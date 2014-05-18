function initializeAnnotations(results){
    function hideBubble(annotationElement){
        if ($(annotationElement).data('dont-hide-annotation')){return};
        $(annotationElement).data('annotationBubble').remove();
        $(annotationElement).removeData('annotationBubble');
    }

    function createAnnotationBubble(annotationElement){
        var annotationBubble = $('<div>')
            .addClass('annotation')
            .hide()
            .appendTo('body');

        $(annotationElement).data('cursorIsInsideAnnotationBubble', false)
        annotationBubble.on('mouseenter', function(){
            $(annotationElement).data('cursorIsInsideAnnotationBubble', true)
        })
        annotationBubble.on('mouseleave', function(){
            $(annotationElement).data('cursorIsInsideAnnotationBubble', false)

            hideBubble(annotationElement)
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
        var bubbleIsAlreadyShown = $(el).data('annotationBubble') !== undefined
        if (bubbleIsAlreadyShown){
            return;
        }

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
            var ret = htmlEscapeQuotes(str)
            .replace(/\</g, '&lt;')
            .replace(/\>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/ /g, '&nbsp;');
            return ret;
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
            if (!$(firstEl).data('annotationBubble')){/* already hidden */;return;}
            hideBubble(firstEl)
        }, 100)
    });

    $('.annotated-element').dblclick(function(){
        $(this).data('dont-hide-annotation', !$(this).data('dont-hide-annotation'));
    })
}



function htmlEscapeQuotes(str){
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#39;');
    return str;
}

function stripNonAsciiCharacters(str){
    return str.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
}
