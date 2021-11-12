<template>
  <div style="padding:20px;">
    <div>
      <el-descriptions>
        <el-descriptions-item label="流程名称">{{ taskInfo.ProcessName }}</el-descriptions-item>
        <el-descriptions-item label="当前任务名称">{{ taskInfo.Name }}</el-descriptions-item>
        <el-descriptions-item label="流程开始时间">{{ taskInfo.CreateTime }}</el-descriptions-item>
        <el-descriptions-item label="任务认领时间">{{ taskInfo.ClaimTime }}</el-descriptions-item>
        <el-descriptions-item label="流程实例ID">{{ taskInfo.ProcessInstanceId }}</el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ taskInfo.Id }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <div>
      <el-button v-for="node in nextNodes" :key="node.Id" @click="openDialog(node)">{{ node.Name }}</el-button>
    </div>
    <div>
      <el-dialog title="选择下一步用户" :visible.sync="showUserChooseDialog" v-show="showUserChooseDialog" width="600px" append-to-body>
        <choose-user @close="()=>{showUserChooseDialog=false}" @setUser="submit"/>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getNextNode, getTaskInfo, completeTask } from '@/api/activiti/repository'
import ChooseUser from '@/components/ChooseUser/chooseUser'

export default {
  name: 'index',
  components: { ChooseUser },
  data() {
    return {
      showUserChooseDialog: false,
      taskId: '',
      nextNodes: [],
      nextNode: {},
      nextNodeUser: {},
      nextNodeWay: {},
      taskInfo: {}
    }
  },
  mounted() {
    this.taskId = this.$route.query.taskId
    this.getTaskInfo()
    this.getNextNode()
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
      variablesJson[this.nextNode.Assignee] = nextUserId
      let submitParams = {
        taskId: this.taskId,
        variablesJson: variablesJson
      }
      completeTask(submitParams).then(res => {
        if (res.data.success) {
          this.$message.success('提交成功')
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
          this.nextNodeUser[node.Id] = node.Assignee
          let wayStr = node['outgoingFlow_ConditionExpression']
          wayStr = wayStr.substr(wayStr.indexOf('${') + 2, wayStr.lastIndexOf('}') - 2)
          this.nextNodeWay[node.Id] = {
            code: wayStr.split('==')[0],
            val: wayStr.split('==')[1]
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
