const ora = require('ora')

/**
 * 命令行loading动效
 * @param {*} fn 执行函数
 * @param {*} message 动画中提示文本
 * @param  {...any} args 执行函数传参
 * @returns 
 */
async function wrapLoading (fn, message, ...args) {
    const spinner = ora(message)
    // 开始加载动画
    spinner.start()
    try {
        const result = await fn(...args)
        // 状态为修改为成功
        spinner.succeed()
        return result
    } catch (error) {
        // 状态为修改为失败
        spinner.fail('Request failed, refetch ...')
        return false
    } 
}

module.exports = wrapLoading
