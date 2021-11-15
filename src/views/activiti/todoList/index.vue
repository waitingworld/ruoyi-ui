<template>
  <div style="text-align: center;">
    <el-table v-loading="loading" :data="tableData" stripe border height="550px">
      <el-table-column :prop="'processName'" label="流程名" align="center"/>
      <el-table-column :prop="'name'" label="当前任务" align="center"/>
      <el-table-column :prop="'createTime'" label="流程开始时间" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :prop="'startTime'" label="任务开始时间" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot="header" slot-scope="scope">
          操作<el-button @click="getTableList" size="mini" type="text" icon="el-icon-refresh"/>
        </template>
        <template slot-scope="scope">
          <el-button @click="dealForm(scope.row.id)" size="mini" type="text">处理</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="pageInfo.total"
      :page.sync="pageInfo.pageNo"
      :limit.sync="pageInfo.pageSize"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="getTableList"
    />
  </div>
</template>

<script>
import { getTodoList } from '@/api/activiti/repository'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: 'todoList',
  data() {
    return {
      loading: false,
      pageInfo: {
        pageNo: 1,
        pageSize: 5,
        total: 0
      },
      tableData: []
    }
  },
  mounted() {
    this.getTableList()
  },
  methods: {
    dealForm(taskId) {
      this.$router.push({
        path: 'formBus',
        query: { taskId: taskId }
      })
    },
    getTableList() {
      this.loading = true
      getTodoList(this.pageInfo).then(res => {
        this.loading = false
        this.tableData = res.data.tasks
        this.pageInfo.total = res.data.total
      })
    }
  }
}
</script>

<style scoped>

</style>
