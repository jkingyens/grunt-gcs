/*
 * grunt-gcs
 * https://github.com/jkingyens/grunt-gcs
 *
 * Copyright (c) 2015 Jeff Kingyens
 * Licensed under the MIT license.
 */

'use strict';

var gcloud = require('gcloud');
var os = require('os');
var fs = require('fs');
var async = require('async');
var path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('gcs', 'Push files to a Google Cloud Storage bucket', function () {

    var opts = this.data.options;
    var gcloudClient = gcloud({
      projectId: opts.project,
      credentials: opts.credentials
    });

    var done = this.async();

    // walk through all files and upload
    var gcs = gcloudClient.storage();
    var bucket = gcs.bucket(opts.bucket);
    async.forEach(this.files, function (filePair, cb) {
      var filePath = filePair.src[0];
      if(grunt.file.isFile(filePath)) {
        var readStream = fs.createReadStream(path.resolve(filePath));
        var writeFile = bucket.file(filePath);
        var writeStream = writeFile.createWriteStream();
        writeStream.on('error', function (e) {
          cb(e);
        });
        writeStream.on('finish', function () {
          grunt.log.writeln('File "' + filePath + '" pushed.');
          cb();
        });
        readStream.pipe(writeStream);
      } else {
        cb();
      }
    }, function (err) {
      done();
    });

  });

};
