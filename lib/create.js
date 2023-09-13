const path = require('path')
const Creator  = require('./Creator')
const fs = require('fs-extra')
const inquirer = require("inquirer")

const actionPrompt = (projectName) => [{
    name: 'action',
    type: 'list',
    message: `${projectName} already exists, Pick an action:`,
    choices: [
        {
            name: 'Overwrite',
            value: 'overwrite'
        },
        {
            name: 'Cancel',
            value: false
        }
    ]
}]

module.exports = async (projectName, options) => {
    // 命令运行时的目录
    const cwd = process.cwd()
    // 目录拼接项目名
    const targetDir = path.resolve(cwd, projectName || '.')
    // console.log(`创建项目的目录名称：${targetDir}`)

    // 当前目录是否已经存在？
    if (fs.existsSync(targetDir)) {
        // 强制覆盖
        if (options.force) {
            // 移除已存在的目录
            console.log(`Removing...`)
            await fs.remove(targetDir)
        } else {
            // 询问用户是否确定要覆盖
            const { action } = await inquirer.prompt(actionPrompt(projectName))
            if (!action) {
                console.log('Cancelled')
                return
            } else if (action === 'overwrite') {
                // 移除已存在的目录
                console.log(`Removing...`)
                await fs.remove(targetDir)
            }
        }
    }

    // 实例化
    const creator = new Creator(projectName, targetDir)
    // 执行创建
    await creator.create()
}
