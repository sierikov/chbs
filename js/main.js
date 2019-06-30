/**
 * That's a Battery Staple!
 * Correct Horse!
 *
 * @author John Van Der Loo, Sierikov Artem
 * @version 2.0
 * @license MIT
 *
 * @returns    {CorrectHorseBatteryStaple}
 * @constructor
 */
function CorrectHorseBatteryStaple() {
    "use strict";

    const self = this;

    /**
     * Application configuration
     * @type {Object}
     */
    this.config = {
        storageKey: "CHBSOptions",
        randomNumberPool: 10
    };

    this.data = [];
    this.words = [];
    this.dataSets = {};

    /**
     * UI references
     * @private
     * @type {Object}
     */
    this.ui = {
        $passwordBox: $("#txt"),
        $btnGenerate: $("#btn-generate"),
        $strength: $("#strength"),
        $strength_val: $("#strength_val"),
        $length: $("#length")
    };

    /**
     * Shorthand to localStorage
     * @private
     * @type {LocalStorage}
     */
    this.storage = window.localStorage || false;

    // Default options
    this.defaults = {
        minLength: 10,
        firstUpper: true,
        minWords: 3,
        appendNumbers: true,
        separator: "-"
    };

    /**
     * Session options
     * @type {Object}
     */
    this.options = {};

    // Set some sane defaults
    this.options = $.extend(this.options, this.defaults);

    /**
     * Set an option and optionally save it to LocalStorage if required.
     *
     * @param    {string} key
     * @param    {*}  value
     */
    this.setOption = function (key, value) {
        this.options[key] = value;

        if (this.options.saveOptions === true) {
            this.saveOptions();
        }
    };


    /**
     * Save Options to LocalStorage
     */
    this.saveOptions = function () {
        self.storage.setItem(self.config.storageKey, JSON.stringify(self.options));
    };


    /**
     * Remove Options from LocalStorage
     */
    this.destroyOptions = function () {
        self.storage.removeItem(self.config.storageKey);
    };


    /**
     * Update the UI for an option.
     *
     * @param    {string}    key
     * @param    {string}    value
     */
    this.setUIOption = function (key, value) {
        let element = $("[data-option='" + key + "']");

        if (element.is("input[type=checkbox]")) {
            element.prop("checked", value);
            return;
        }

        element.val(value);

    };


    /**
     * Set all UI options based on the current options.
     */
    this.setAllUIOptions = function () {
        for (let opt in this.options) {
            if (this.options.hasOwnProperty(opt)) {
                self.setUIOption(opt, this.options[opt]);
            }
        }

    };

    /**
     * Set a config option from the UI
     *
     * @param {HTMLElement} htmlElement
     */
    this.setOptionFromUI = function (htmlElement) {
        let element = $(htmlElement),
            val = element.val();

        if (element.is("[type=checkbox]")) {
            val = element.prop("checked");
        }

        self.setOption(element.data("option"), val);
    };


    /**
     * Load a data file and fire an optional callback.
     * The data file is assumed to be a CSV list of words and will be
     * split in to an array of words and appended to the main data key
     *
     * @param {string} file File to load
     * @param {Function} [callback] optional callback
     */
    this.loadData = function (file, callback) {

        $.get("data/" + file, function (content, textStatus) {

            self.dataSets[file] = content.toString().split(",");
            self.data = self.data.concat(self.dataSets[file]);

            if (callback) {
                callback.call(this, content, textStatus);
            }

        }, "text");


    };


    /**
     * Retrieve a number of random words from our set of Data
     *
     * @param {number} amount Number of words to get
     *
     * @returns {Array}  The array of words
     */
    this.getRandomWords = function (amount) {
        let len = this.data.length,
            rand = Math.floor(Math.random() * len),
            i, word;

        for (i = 0; i < amount; i++) {
            word = this.data[rand];
            word = this.options.firstUpper ? word.charAt(0).toUpperCase() + word.slice(1) : word;
            this.words.push(word);
            rand = Math.floor(Math.random() * len);
        }

        return this.words;
    };


    /**
     * Generate a password
     */
    this.generate = function () {

        this.words = [];

        this.options.minWords = parseInt(this.options.minWords, 10) || this.defaults.minWords;
        this.options.minLength = parseInt(this.options.minLength, 10) || this.defaults.minLength;

        this.fullPassword = this.getWords();
        this.ui.$passwordBox.val(this.fullPassword).trigger("change");
        this.update(this.fullPassword);

        return this.fullPassword;
    };


    /**
     * Get words from the dictionary
     *
     * @param    {number}    [numWords]    Number of words to get
     */
    this.getWords = function (numWords) {
        let fullword;

        if (numWords === undefined) { numWords = this.options.minWords; }

        this.getRandomWords(numWords);
        //generate a full string to test against min length
        fullword = this.words.join(this.options.separator.substring(0, 1) || "");

        //recurse untill our password is long enough;
        if (fullword.length < this.options.minLength) {
            return this.getWords(1);
        }
        else {
            //once we have enough words
            fullword = this.join(this.words, this.stringToArray(this.options.separator));
            return fullword;
        }
    };

    /**
     * Join a set of words with random separators
     *
     * @param   {Array}    words       Array of words
     * @param   {Array}    separators
     * @returns {string}
     */
    this.join = function (words, separators) {
        var wordsLen,
            i,
            theString = "",
            symbol = "";

        wordsLen = words.length;

        if (this.options.appendNumbers) {
            words.push(Math.floor(Math.random() * this.config.randomNumberPool));
            wordsLen = words.length;
        }

        for (i = 0; i < wordsLen; i++) {

            if (i !== wordsLen - 1) {
                symbol = this.getSeparator(separators);
            }
            else {
                symbol = "";
            }

            theString += words[i] + symbol;
        }
        return theString;
    };


    /**
     * Convert a string to an array of characters
     *
     * @param {string} str The string
     * @returns {(Array|boolean)}  Array of characters
     */
    this.stringToArray = function (str) {
        var chars = [],
            i = 0,
            len = str.length || 0,
            theChar = "";

        if (typeof(str) !== "string" && len === 0) {
            return false;
        }

        for (i; i < len; i++) {
            theChar = str.substring(i, i + 1);
            chars.push(theChar);
        }
        return chars;
    };


    /**
     * Get a random separator from the separators array
     *
     * @param      {Array}    seps
     * @returns    {String}
     */
    this.getSeparator = function (seps) {
        return seps[Math.floor(Math.random() * seps.length)] || "";
    };


     this.update = function(password) {
        console.log(password);
        let score = scorePassword(password);
        this.ui.$strength.width((score > 100 ? 100 : score).toString() + "%");
        this.ui.$strength_val.text("Strength: " + score + " / 235");
        this.ui.$length.text("Length: " + (password.length) + " letters");
        return 0;
    };

    /**
     * Bind all UI related events
     */
    this.bindEvents = function () {

        //Update options when UI is updated
        $("[data-option]").on(  "keyup change",     function () { self.setOptionFromUI(this);   } );
        this.ui.$btnGenerate.on("click keypress",   function () { self.generate();              } );
		this.ui.$passwordBox.on("keyup change",     function () { self.update($(this).val());   } );

        // Update the saveOptions option
        $("#save-options").on("change", function () {
            if ($(this).prop("checked") === true) {
                self.saveOptions();
            }
            // If we no longer wish to save, destroy our LS entry
            else {
                self.destroyOptions();
            }

        });


        $(".fieldset")
            .on('click', "legend", function () {
                $(this).closest(".fieldset").toggleClass("active");
            });

    };


    /**
     * Initialize this horse
     */
    this.init = function () {

        // Load options from the LocalStorage if present
        if (this.storage && this.storage.getItem(this.config.storageKey)) {
            try {
                this.options = JSON.parse(this.storage.getItem(this.config.storageKey));
                this.setAllUIOptions();

            } catch (e) {
                console.log("Could not parse settings from LocalStorage");
            }

        }

        // no local storage available, read the options from the UI
        else {
            $("[data-option]").each(function () {
                self.setOptionFromUI(this);
            });
        }


        // Load the default words
        this.loadData("wordlist.txt", function () {
            self.generate();
        });

        // Bind Events
        this.bindEvents();
    };

    this.init();

    return this;

}

// Set up for AMD inclusion
if (typeof define === "function") {
    define(["jquery"], function () {
        "use strict";
        return CorrectHorseBatteryStaple;
    });
}
else {
    window.CHBS = new CorrectHorseBatteryStaple();
}

function scorePassword(pass) {
    let score = 0;
    if (!pass) return score;

    // award every unique letter until 5 repetitions
    let letters = {};
    for (let i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    const variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    };

    let variationCount = 0;
    for (let check in variations) {
        variationCount += (variations[check] === true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return score.toFixed(5);
}


/*
 This software is licensed under the MIT License:

 Copyright (c) 2019, John Van Der Loo, Sierikov Artem

 Permission is hereby granted, free of charge, to any person obtaining a copy of this
 software and associated documentation files (the "Software"), to deal in the Software
 without restriction, including without limitation the rights to use, copy, modify, merge,
 publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
