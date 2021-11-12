<template>
<div>
  <el-row>
    <el-col :span="12">
      <todo-list/>
    </el-col>
    <el-col :span="12">
      <done-list/>
    </el-col>
  </el-row>
</div>
</template>

<script>
import TodoList from '@/views/activiti/todoList'
import DoneList from '@/views/activiti/doneList'
export default {
  name: 'workbench',
  components: { DoneList, TodoList }
}
</script>

<style scoped>

</style>
