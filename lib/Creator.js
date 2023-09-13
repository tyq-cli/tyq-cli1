const { getRepoList } = require('./utils/http')
const inquirer = require("inquirer")
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
const util = require('util')
const wrapLoading = require('./utils/loading')
const { chalk, log, hasGit, hasProjectGit, execa } = require('@vue/cli-shared-utils')

class Creator {
    constructor (projectName, context) {
        this.name = projectName
        this.context = context
        this.downloadGitRepo = util.promisify(downloadGitRepo) // 让download-git-repo支持promise
    }

    async create () {
        // 1）获取模板名称
        const repo = await this.getRepo()
        // 2) 下载模板
        const res = await this.download(repo)
        if (res === false) {
            console.log(`\r\nDownload failure`)
            return
        }
        // 3) 初始化git
        await this.initGit()
        // 4）模板使用提示
        console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
        console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
        console.log(`\r\n  yarn install`)
        console.log('  yarn run dev\r\n')
    }

    // 获取用户选择的模板
    async getRepo () {
        // 1）从远程拉取模板列表
        const repoList = await wrapLoading(getRepoList, 'fetch template');
        if (!repoList) return
    
        // 过滤需要的模板名称
        const repos = repoList.map(item => item.name)
    
        // 2）用户选择自己新下载的模板名称
        const { repo } = await inquirer.prompt({
          name: 'repo',
          type: 'list',
          choices: repos,
          message: 'Please choose a template to create project'
        })
    
        // 3）return 用户选择的模板
        return repo
    }

    // 下载远程模板
    async download (repo) {
        // 1）拼接下载地址
        const requestUrl = `Sugarqiao/${repo}`

        // 2）调用下载方法
        const res = await wrapLoading(
            this.downloadGitRepo, // 远程下载方法
            'download template', // 加载提示信息
            requestUrl, // 参数1: 下载地址
            this.context, // 参数2: 创建位置
        )
        return res
    }

    // 判断是否可以初始化 git 仓库：系统安装了 git 且目录下未初始化过，则初始化
    shouldInitGit () {
        if (!hasGit()) {
            // 系统未安装 git
            return false
        }
    
        // 项目未初始化 Git
        return !hasProjectGit(this.context)
    }

    // 初始化git
    async initGit () {
        // 初始化git仓库，以至于 vue-cli-service 可以设置 git hooks
        const shouldInitGit = this.shouldInitGit()
        if (shouldInitGit) {
            log(`🗃 初始化 Git 仓库...`)
            this.run('git init')
        }
    }

    // 执行命令行
    run (command, args) {
        if (!args) { [command, ...args] = command.split(/\s+/) }
        return execa(command, args, { cwd: this.context })
    }
}

module.exports = Creator