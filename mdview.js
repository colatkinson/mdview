#!/bin/env node
var blessed = require('blessed');
var fs = require('fs');
var htmlToText = require('html-to-text');
var marked = require('marked');
var program = require('commander');

var renderer = new marked.Renderer();

var ITALIC_COLOR = 'blue';

renderer.heading = function (text, level) {
    var tags = [['bold'],
                [ITALIC_COLOR + '-fg'],
                ['center', 'bold'],
                ['center', ITALIC_COLOR + '-fg'],
                ['underline'],
                ['center', 'underline']
               ];
    var opening = '';
    var closing = '';
    for(var i = 0; i < tags[level - 1].length; i++) {
        opening += '{' + tags[level - 1][i] + '}';
        closing = '{/' + tags[level - 1][i] + '}' + closing;
    }
    return opening + '<h' + level + '>' + text + '</h' + level + '>' + closing + '<br />';
};

renderer.link = function(href, title, text) {
    return '{underline}{cyan-fg}' + href + '{/cyan-fg}{/underline}';
};

renderer.em = function(text) {
    return '{' + ITALIC_COLOR + '-fg}*' + text + '*{/' + ITALIC_COLOR + '-fg}';
};

renderer.strong = function(text) {
    return '{bold}' + text + '{/bold}';
};

renderer.del = function(text) {
    return '{gray-fg}' + text + '{/gray-fg}';
};

renderer.blockquote = function(quote) {
    return '{inverse}' + quote + '{/inverse}';
}

renderer.code = function(code, language) {
    return '{green-fg}<pre>' + code + '</pre>{/green-fg}';
}

renderer.hr = function() {
    return '{blue-bg}<br /><br />{/blue-bg}<br /><br />';
}

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

function mainBox(cont, files) {
    // Create a screen object.
    var screen = blessed.screen({
        smartCSR: true
    });

    screen.title = program._name + ' ' + files.pop();

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        if(files.length === 0) {
            return process.exit(0);
        } else {
            loadFiles(files);
            screen.destroy();
        }
    });

    // Main box
    var box = blessed.box({
        scrollable: true,
        keys: true,
        tags: true,
        parent: screen,
        scrollbar: {bg: 'white'},
        grabKeys: true,
        alwaysScroll: true,
        content: cont
    });

    box.focus();

    screen.append(box);

    // Render the screen.
    screen.render();
}

// Convert the Markdown data to text
function convertMD(data) {
    var html = marked(data);
    var txt = htmlToText.fromString(html, {tables: true, wordwrap: false});
    return txt;
}

function loadFiles(files) {
    var buf = fs.readFile(files[files.length - 1], {encoding: 'utf8'}, function(err, data) {
        if(!err) {
            mainBox(convertMD(data), files);
        } else {
            console.error(err);
        }
    });
}

program
    .version(require('./package.json').version)
    .description('An simple command line markdown viewer')
    .usage('<FILE...>')
    .parse(process.argv);

if(program.args.length < 1) {
    program.help();
}

program.args.reverse();
loadFiles(program.args);
