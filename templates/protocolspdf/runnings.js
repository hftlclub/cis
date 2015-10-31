exports.header = null

exports.footer = {
    height: '0.7cm',
    contents: function(pageNum, numPages) {
        return '<div style="text-align: center; font-weight: bold; font-family: Open Sans;">&ndash;&nbsp; Seite ' + pageNum + ' / ' + numPages + ' &nbsp;&ndash;</div>'
    }
}
