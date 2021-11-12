<template>
  <div style="text-align: center;">

    <el-button size="mini" @click="getTableList">刷新</el-button>
    <el-table v-loading="loading" :data="tableData">
      <el-table-column/>
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
import { getDoneList } from '@/api/activiti/repository'

export default {
  name: 'doneList',
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
    getTableList() {
      this.loading = true
      getDoneList(this.pageInfo).then(res => {
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
