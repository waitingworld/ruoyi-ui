<template>
  <div>
    <el-row>
      <el-col :span="12">
        <todo-list ref="todoList" style="padding: 10px;"/>
      </el-col>
      <el-col :span="12">
        <done-list ref="doneList" style="padding: 10px;"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import TodoList from '@/views/activiti/todoList'
import DoneList from '@/views/activiti/doneList'

export default {
  name: 'workbench',
  components: { DoneList, TodoList },
  created() {
    this.$bus.on('refresh', this.refresh)
  },
  methods: {
    refresh() {
      setTimeout(() => {
        this.$refs.todoList.getTableList()
      })
      setTimeout(() => {
        this.$refs.doneList.getTableList()
      })
    }
  },
  beforeDestroy() {
    this.$bus.off('refresh')
  }
}
</script>

<style scoped>

</style>
