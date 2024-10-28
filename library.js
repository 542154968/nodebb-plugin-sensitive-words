"use strict";

const nconf = require.main.require("nconf");
const winston = require.main.require("winston");

const meta = require.main.require("./src/meta");

const controllers = require("./lib/controllers");

const routeHelpers = require.main.require("./src/routes/helpers");

const plugin = {};

/**
 * 根据填写的敏感词生成正则表达式
 * @returns {RegExp}
 */
const getSensitiveWords = async () => {
  const data = await meta.settings.get("sensitive-words");
  return new RegExp(
    (data.sensitiveWords || "")
      .split(/,|，/)
      .map(item => item.trim())
      .join("|"),
    "gi"
  );
};

/**
 * 过滤文本
 * @param {string} content
 * @returns {Promise<string>}
 */
const filterContent = async content => {
  const regExp = await getSensitiveWords();
  return typeof content === "string" ? content.replace(regExp, " ** ") : "";
};

plugin.init = async params => {
  const { router /* , middleware , controllers */ } = params;

  routeHelpers.setupAdminPageRoute(
    router,
    "/admin/plugins/sensitive-words",
    controllers.renderAdminPage
  );
};

plugin.addAdminNavigation = header => {
  header.plugins.push({
    route: "/plugins/sensitive-words",
    icon: "fa-tint",
    name: "敏感词过滤",
  });

  return header;
};

/**
 * 过滤帖子标题
 * @param {*} data
 */
plugin.filterTopic = async data => {
  if (data.topic?.title) {
    data.topic.title = await filterContent(data.topic?.title);
  }
  return data;
};

/**
 * 过滤回复内容和帖子内容
 * @param {*} data
 */
plugin.filterPost = async data => {
  if (data.post?.content) {
    data.post.content = await filterContent(data.post.content);
  }
  return data;
};

/**
 * 过滤标签内容
 * @param {*} data
 */
plugin.filterTags = async data => {
  const regExp = await getSensitiveWords();
  if (Array.isArray(data.tags)) {
    data.tags = data.tags.map(item => {
      return item.replace(regExp, "*");
    });
  }
  return data;
};

/**
 * 过滤关于我
 * @param {*} data
 */
plugin.filterAboutMe = async data => {
  return await filterContent(data);
};

/**
 * 过滤签名档
 * @param {*} data
 */
plugin.filterSignature = async data => {
  if (data.userData?.signature) {
    data.userData.signature = await filterContent(data.userData.signature);
  }
  return data;
};

module.exports = plugin;
