var generalCss = '{{generalCss}}';
var generalJs = '{{generalJs}}';

$('body').append('<style>' + generalCss + '</style>');
$('body').append('<script>' + generalJs + '</script>');

function stripFinalLineBreaks(str){
    var lines = str.split('\n');
    // Github strips out final new lines in gists, so always strip them
    var reversedLines = lines.reverse();
    for (var i=0; i< reversedLines.length;i++){
        if (reversedLines[i] == ''){
            reversedLines.shift();
            i--;
        }
        else {
            break;
        }
    }
    lines = reversedLines.reverse();
    return lines.join('\n')
}

var code = '';
var lineElements;
if ($('.code-body .line').length > 0){
    // github.com
    lineElements = $('.code-body .line')
} else {
    //gist.github.com
    lineElements = $('.line-pre .line');
}
lineElements.each(function(){
    var text = $(this).text();
    // Replace non breaking spaces
    text = text.replace(/\u00A0/g, ' ');
    // Pygments puts nbsp's into empty lines, so strip them out...
    if (text == ' '){
        text = '';
    }
    code += text + '\n';
});
code = stripFinalLineBreaks(code)

code = code.replace(/\n/g,'\n');
console.log('code', '---' + code + '---')
var fileHash = sha1(stripNonAsciiCharacters(code));

$.get('http://localhost:7001/results/' + fileHash, function(response){
    if (response.setup && response.setup[0]){
        displayResults(response.setup, response.results);
    }
});

function displayResults(setup, results){
    var logItemIndex = 0;
    var pos = 0;

    lineElements.each(function(){
        $(this).contents().each(function(){
            var logItem = setup[logItemIndex];

            if (logItem && pos >= logItem.range[0] && pos <= logItem.range[1]){
                var annotationClass = 'js-annotation-index-' + logItemIndex;
                $(this).attr('data-annotation-index', logItemIndex)
                $(this).addClass(annotationClass);
                $(this).addClass('annotated-element');
                if ($('.' + annotationClass).length > 1){
                    $('.' + annotationClass).css('border-left-width', '0').css('padding-left', 0).css('padding-right', 0);
                    $('.' + annotationClass).css('border-right-width', '0').css('padding-left', 0).css('padding-right', 0);
                    $('.' + annotationClass).first().css('border-left-width', '1px').css('padding-left', 'inherit')
                    $('.' + annotationClass).last().css('border-right-width', '1px').css('padding-right', 'inherit');
                }
                $(this).attr('data-debug-start-index', pos);
                if (results[logItemIndex] === undefined){
                    $(this).addClass('no-logging-result')
                }
            }
            if (this.nodeType === 3){
                pos += this.textContent.length;
            } else {
                pos += $(this).text().length;
            }

            if (logItem && logItem.range[1] <= pos){
                logItemIndex++;
            }
        })
        pos++;
    });

    initializeAnnotations(results);
}


// https://github.com/kvz/phpjs/blob/master/functions/strings/sha1.js
/*
Copyright (c) 2013 Kevin van Zonneveld (http://kvz.io)
and Contributors (http://phpjs.org/authors)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
function sha1(str) {
  //  discuss at: http://phpjs.org/functions/sha1/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Michael White (http://getsprink.com)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //    input by: Brett Zamir (http://brett-zamir.me)
  //   example 1: sha1('Kevin van Zonneveld');
  //   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

  var rotate_left = function (n, s) {
    var t4 = (n << s) | (n >>> (32 - s));
    return t4;
  };

  /*var lsb_hex = function (val) {
   // Not in use; needed?
    var str="";
    var i;
    var vh;
    var vl;

    for ( i=0; i<=6; i+=2 ) {
      vh = (val>>>(i*4+4))&0x0f;
      vl = (val>>>(i*4))&0x0f;
      str += vh.toString(16) + vl.toString(16);
    }
    return str;
  };*/

  var cvt_hex = function (val) {
    var str = '';
    var i;
    var v;

    for (i = 7; i >= 0; i--) {
      v = (val >>> (i * 4)) & 0x0f;
      str += v.toString(16);
    }
    return str;
  };

  var blockstart;
  var i, j;
  var W = new Array(80);
  var H0 = 0x67452301;
  var H1 = 0xEFCDAB89;
  var H2 = 0x98BADCFE;
  var H3 = 0x10325476;
  var H4 = 0xC3D2E1F0;
  var A, B, C, D, E;
  var temp;

  // utf8_encode
  str = unescape(encodeURIComponent(str));
  var str_len = str.length;

  var word_array = [];
  for (i = 0; i < str_len - 3; i += 4) {
    j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
    word_array.push(j);
  }

  switch (str_len % 4) {
  case 0:
    i = 0x080000000;
    break;
  case 1:
    i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
    break;
  case 2:
    i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
    break;
  case 3:
    i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
      8 | 0x80;
    break;
  }

  word_array.push(i);

  while ((word_array.length % 16) != 14) {
    word_array.push(0);
  }

  word_array.push(str_len >>> 29);
  word_array.push((str_len << 3) & 0x0ffffffff);

  for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
    for (i = 0; i < 16; i++) {
      W[i] = word_array[blockstart + i];
    }
    for (i = 16; i <= 79; i++) {
      W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
    }

    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;

    for (i = 0; i <= 19; i++) {
      temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 20; i <= 39; i++) {
      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 40; i <= 59; i++) {
      temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 60; i <= 79; i++) {
      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }

  temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
  return temp.toLowerCase();
}
