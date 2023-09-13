// 通过 axios 处理请求
const axios = require('axios')

axios.interceptors.response.use(res => {
  return res.data
})


/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList() {
  return axios.get('https://api.github.com/users/Sugarqiao/repos')
}

/**
 * 获取模板信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function getTemplate (repo) {
  return axios.get(`https://api.github.com/repos/Sugarqiao/${repo}`)
}

module.exports = {
  getRepoList,
  getTemplate,
}
