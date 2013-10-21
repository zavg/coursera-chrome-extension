/*
 Popup window script
 Author: @sergeyzavg
 */

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.executeScript(null, {file:"jquery.js"}, function () {
        chrome.tabs.executeScript(null, {file:"content.js"}, function () {
            getCourseInfo(function (updatedData) {
                var courses = {};
                chrome.storage.sync.get("courses", function (data) {
                    console.log(data);
                    if (data.courses)
                        courses = JSON.parse(data.courses);
                    if (updatedData) {
                        $('.container').append($('#alert').html());
                        courses[updatedData.id] = updatedData;
                        delete courses['undefined'];
                        chrome.storage.sync.set({"courses":JSON.stringify(courses)}, function () {
                        });
                    }
                    for (var i in courses) {
                        $('.container').append(renderItem(courses[i]));
                        $("#" + courses[i].id).click(function (i) {
                            return function () {
                                chrome.tabs.create({url:courses[i].courseUrl});
                            }
                        }(i));
                    }
                    $('.alert').fadeOut(3000);
                });

            });
        });
    });
});

function getCourseInfo(callback) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendRequest(tab.id, {req:"getCourseInfo"}, function (response) {
            callback(response.reply);
        });
    });
}

function renderTime(time) {

    return Math.round(time / 3600) + " h "
         + Math.round(time % 3600 / 60) + " min";
}

function renderItem(courseInfo) {
    var progress = Math.round(courseInfo.viewed * 100 / courseInfo.total);
    var color = (progress < 33) ? "progress-bar-danger" :
               ((progress < 66) ? "progress-bar-warning" : "progress-bar-success");
    return $("#item-template").html()
        .replace(/\{id\}/,        courseInfo.id)
        .replace(/\{logoUrl\}/,   courseInfo.logoUrl)
        .replace(/\{name\}/,      courseInfo.name)
        .replace(/\{courseUrl\}/, courseInfo.courseUrl)
        .replace(/\{total\}/,     renderTime(courseInfo.total))
        .replace(/\{viewed\}/,    renderTime(courseInfo.viewed))
        .replace(/\{remained\}/,  renderTime(courseInfo.total - courseInfo.viewed))
        .replace(/\{progress\}/g, progress)
        .replace(/\{color\}/g,    color);
}
