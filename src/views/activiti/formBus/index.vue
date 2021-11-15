<template>
  <div style="padding:20px;">
    <div>
      <el-descriptions>
        <el-descriptions-item label="流程名称">{{ taskInfo.processName }}</el-descriptions-item>
        <el-descriptions-item label="当前任务名称">{{ taskInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="流程开始时间">{{ parseTime(taskInfo.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="任务认领时间">{{ parseTime(taskInfo.claimTime) }}</el-descriptions-item>
        <el-descriptions-item label="流程实例ID">{{ taskInfo.processInstanceId }}</el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ taskInfo.id }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <div v-if="!disable">
      <div v-show="nextNodes.length>0">
        <el-button v-for="node in nextNodes" :key="node.Id" @click="openDialog(node)">{{ node.name }}</el-button>
      </div>
      <div v-show="nextNodes.length<=0">
        <el-button @click="submit">提交</el-button>
      </div>
    </div>
    <div>
      <el-dialog title="选择下一步用户" :visible.sync="showUserChooseDialog" v-show="showUserChooseDialog" width="950px"
                 append-to-body
      >
        <choose-user @close="()=>{showUserChooseDialog=false}" @setUser="submit"/>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getNextNode, getTaskInfo, completeTask } from '@/api/activiti/repository'
import ChooseUser from '@/components/ChooseUser/chooseUser'
import {parseTime} from '@/utils/ruoyi'

export default {
  name: 'index',
  components: { ChooseUser },
  data() {
    return {
      showUserChooseDialog: false,
      taskId: '',
      disable: '',
      nextNodes: [],
      nextNode: {},
      nextNodeUser: {},
      nextNodeWay: {},
      taskInfo: {}
    }
  },
  mounted() {
    this.taskId = this.$route.query.taskId
    this.disable = this.$route.query.disable === 'true'
    this.getTaskInfo()
    if(!this.disable){
      this.getNextNode()
    }
  },
  methods: {
    getTaskInfo() {
      getTaskInfo({ taskId: this.taskId }).then(res => {
        this.taskInfo = res.data
      })
    },
    getNextNode() {
      getNextNode({ taskId: this.taskId }).then(res => {
        this.nextNodes = res.data
      })
    },
    submit(nextUserId) {
      let variablesJson = {}
      if (nextUserId) {
        variablesJson[this.nextNode.assignee] = nextUserId
      }
      if (this.nextNodeWay[this.nextNode.id]) {
        variablesJson[this.nextNodeWay[this.nextNode.id].code] = this.nextNodeWay[this.nextNode.id].val
      }
      let submitParams = {
        taskId: this.taskId,
        variablesJson: variablesJson
      }
      completeTask(submitParams).then(res => {
        if (res.data.success) {
          this.$message.success('提交成功')
          this.$bus.emit('refresh')
          this.$store.dispatch('tagsView/delView', this.$route)
          this.$router.push({
            path: 'workbench'
          })
        }
      })
    },
    openDialog(node) {
      this.nextNode = node
      this.showUserChooseDialog = true
    }
  },
  watch: {
    nextNodes: {
      handler(val) {
        this.nextNodes.forEach(node => {
          this.nextNodeUser[node.id] = node.assignee
          let wayStr = node['outgoingFlow_ConditionExpression']
          if (wayStr) {
            wayStr = wayStr.substr(wayStr.indexOf('${') + 2, wayStr.lastIndexOf('}') - 2)
            this.nextNodeWay[node.id] = {
              code: wayStr.split('==')[0],
              val: wayStr.split('==')[1]
            }
          }
        })
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style scoped>

</style>
