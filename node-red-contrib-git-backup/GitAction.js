const execSync = require('child_process').execSync

class GitAction{
    constructor(node, config) {
        this.node = node
        this.config = config
    }

    sync(message, RED) {
      let userDir = ''
      let node = this.node
      if (RED.settings.userDir) {
        userDir = RED.settings.userDir
      }
      else {
        userDir = process.env.HOME + '/.node-red'
      }

      let flowFile = ''
      if (RED.settings.flowFile) {
        flowFile = RED.settings.flowFile
      }
      else {
        flowFile = 'flows_'+require('os').hostname()+'.json'
      }
      // get flows.json
      let flowsFilePath = userDir + '/' + flowFile

      let cmd = ''
      let execOpt = {cwd: RED.settings.userDir, encoding: 'utf8'}
      let gitStatus = ''
      let gitCommit = ''
      let gitPush = ''

      try {
        // git init
        cmd = [
          'cd ' + RED.settings.userDir,
          '[ -e "./.git" ] && : || git init'
        ].join(';')
        execSync(cmd)

        // git remote add origin
        if (node.git.git) {
          cmd = [
            'cd ' + RED.settings.userDir,
            'LEN=`git remote`',
            '[ ${#LEN} -eq 0 ] && git remote add origin ' + node.git.git + ' || :'
          ].join(';')
          execSync(cmd)
          execSync('git remote set-url origin ' + node.git.git, execOpt)
        }

        // git config --local user.name
        if (node.git.username) {
          cmd = [
            'cd ' + RED.settings.userDir,
            'git config --local user.name "' + node.git.username + '"'
          ].join(';')
          execSync(cmd)
        }

        // git config --local user.email
        if (node.git.useremail) {
          cmd = [
            'cd ' + RED.settings.userDir,
            'git config --local user.email "' + node.git.useremail + '"'
          ].join(';')
          execSync(cmd)
        }

        // branch
        console.log("branch")
        let branch = ''
        if (node.branch && node.branch !== 'master') {

          // Existence check of the branch.
          let localBranchList = execSync('git branch', execOpt)
          let reg = new RegExp(' ' + node.branch + '\n')
          let isLocalBranch = reg.test(localBranchList)
          console.log(isLocalBranch, localBranchList.length)

          if (localBranchList) {
            // get current branch name
            let currentBranch = execSync('git rev-parse --abbrev-ref HEAD', execOpt)

            // Existence check of source branch.
            let reg3 = new RegExp(' ' + node.sourcebranch + '\n')
            let isSourceBranch = reg3.test(localBranchList)
            console.log(isLocalBranch)
            let sourceBranch = node.sourcebranch
            if (node.sourcebranch || !isSourceBranch) {
              sourceBranch = currentBranch
            }
            
            // When the branch exists, change it.
            if (isLocalBranch) {
              console.log("isLocalBranch true")
              execSync('git checkout ' + node.branch, execOpt)
            }
            // When there is no branch, create the branch.
            else {
              console.log("isLocalBranch false")
              execSync('git checkout -b ' + node.branch + ' ' + sourceBranch, execOpt)
            }

            // Existence check of the remote branch.
            let remoteBranchList = execSync('git branch -r', execOpt)
            let reg2 = new RegExp('/' + node.branch + '\n')
            let isRemoteBranch = reg2.test(remoteBranchList)
            console.log(isRemoteBranch)

            // When there is no branch, create the remote branch.
            if (!isRemoteBranch) {
              console.log("isRemoteBranch false")
              execSync('git push -u origin ' + node.branch, execOpt)
            }
          } 
        }

        // git add flows
        cmd = [
          'cd ' + RED.settings.userDir,
          'git add ' + 'flows_*.json flows_*_cred.json ',
        ].join(';')
        execSync(cmd)

        // git add
        if (node.gitadd) {
          let gitaddList = node.gitadd.split(',')
          let gitadd = gitaddList.map(function(x){
            return 'git add ' + x;
          });
          gitadd.unshift('cd ' + RED.settings.userDir);
          cmd = gitadd.join(';')
          execSync(cmd)
        }

        // git rm --cached
        if (node.gitrmcache) {
          let gitrmcacheList = node.gitrmcache.split(',')
          let gitrm = gitrmcacheList.map(function(x){
            return 'git rm --cached ' + x;
          });
          gitrm.unshift('cd ' + RED.settings.userDir);
          cmd = gitrm.join(';')
          execSync(cmd)
        }
        
        // git status
        cmd = [
          'cd ' + RED.settings.userDir,
          'git status --untracked-files=no',
        ].join(';')
        gitStatus = execSync(cmd).toString()
        
        

        // git commit
        cmd = [
          'cd ' + RED.settings.userDir,
          'git commit -m "' + message + '"',
        ].join(';')
        gitCommit = execSync(cmd).toString()

        // git push
        if (node.git.git) {
          cmd = [
            'cd ' + RED.settings.userDir,
            'git push -u origin ' + node.branch
          ].join(';')
          gitPush = execSync(cmd).toString()
        }
        return 'success'
      } catch(err) {
        RED.comms.publish("debug",{msg: err})
        node.status({fill:"red",shape:"dot",text:"Error"});
        return 'fail'
      } finally {
        if (node.debugging) {
          RED.comms.publish("debug",{msg: {
            status: gitStatus,
            commit: gitCommit,
            push: gitPush
          }})
          //node.send({payload: msg})
          node.status({});
        }
      }
    
    }
}

module.exports = GitAction