/**
 * Copyright 2020 John McLear <john@mclear.co.uk>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const log4js = require('ep_etherpad-lite/node_modules/log4js');
const statsLogger = log4js.getLogger('stats');
const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');
const stats = require('ep_etherpad-lite/node/stats');

exports.eejsBlock_timesliderStyles = function (fn, args, cb) {
  return cb();
};

exports.eejsBlock_timesliderScripts = function (fn, args, cb) {
  args.content += eejs.require('ep_who_did_what/static/js/whoDidWhat.js');
  // "<script type='text/javascript' src='../../static/plugins/ep_who_did_what/static/js/whoDidWhat.js'></script>";
  return cb();
};

exports.eejsBlock_timesliderEditbarRight = function (fn, args, cb) {
  args.content += eejs.require('ep_who_did_what/templates/button.ejs', {}, module);
  return cb();
};

exports.eejsBlock_timesliderBody = function (fn, args, cb) {
  args.content += eejs.require('ep_who_did_what/templates/modal.ejs', {}, module);
};

exports.clientVars = function (hook, context, callback) {
  if (!settings.ep_what_have_i_missed) settings.ep_what_have_i_missed = {};
  return callback({
    ep_what_have_i_missed: {
    },
  });
};

exports.eejsBlock_mySettings = function (hook, context, callback) {
  if (!settings.ep_what_have_i_missed) settings.ep_what_have_i_missed = {};
  context.content += eejs.require('ep_what_have_i_missed/templates/settings.ejs', {
  });
  callback();
};
