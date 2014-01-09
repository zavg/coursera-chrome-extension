/*
 Script injected into content page
 Author: @sergeyzavg
 */

// Some patterns to calculate lections time
var timePatterns = [
    /\((\d+):(\d+)\)/,  // (17:34)
    /\((\d+) min\)/,    // (17 min)
    /\[(\d+) min\]/,    // [17 min]
    /\((\d+)m(\d+)s\)/, // (17m34s)
    /\[(\d+)m(\d+)s\]/  // [17m34s]
];

function getCourseInfo() {
    function parseTime(text){
        var i = 0, acc = 0;
        do {
            match = (new RegExp(timePatterns[i++])).exec(text);
        } while (timePatterns[i] && !match);
        if (match != null) {
            if (match[1]) acc += parseInt(match[1] * 60);
            if (match[2]) acc += parseInt(match[2]);
        }
        return acc;
    }
    var courseInfo = {
        name:$('.course-topbanner-name').text(),
        courseUrl:$('.course-navbar-item.active:first a').attr("href"),
        logoUrl:$('.course-navbar-container:first img').attr('src'),
        instructor:$('.course-topbanner-instructor').text()
    };
    if (!courseInfo.name) return null;
    console.log(courseInfo);
    courseInfo.id = courseInfo.courseUrl.replace(/\//g,'_');
    courseInfo.viewed = courseInfo.unviewed = courseInfo.total = 0;
    $('.viewed .lecture-link').each(function () {
        courseInfo.viewed += parseTime($(this).text());
    });
    $('.unviewed .lecture-link').each(function () {
        courseInfo.unviewed += parseTime($(this).text());
    });
    courseInfo.total = courseInfo.viewed + courseInfo.unviewed;
    if (courseInfo.total == 0) return null;
    return courseInfo;
}

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.req == 'getCourseInfo') sendResponse({reply:getCourseInfo()});
});