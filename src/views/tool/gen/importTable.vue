<template>
  <!-- 导入表 -->
  <el-dialog title="导入表" :visible.sync="visible" width="80%" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="数据库" prop="DBName">
        <el-select v-model="queryParams.DBName" filterable placeholder="请选择数据库" @change="handleQuery">
          <el-option v-for="item in dbList" :key="item.value" :label="item.value" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-select v-model="queryParams.userName" filterable placeholder="请选择用户" @change="handleQuery">
          <el-option v-for="item in userList" :key="item.value" :label="item.value" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="表名称" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="请输入表名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="请输入表描述"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="dbTableList" @selection-change="handleSelectionChange"
                height="260px"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="tableName" label="表名称" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="tableComment" label="表描述" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间"></el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { queryDBList, listDbTable, importTable, getUserList } from '@/api/tool/gen'

export default {
  data() {
    return {
      // 遮罩层
      visible: false,
      // 选中数组值
      tables: [],
      // 总条数
      total: 0,
      // 表数据
      dbTableList: [],
      dbList: [],
      userList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        DBName: undefined,
        userName: undefined,
        tableName: undefined,
        tableComment: undefined
      }
    }
  },
  watch: {
    'queryParams.DBName': {
      handler(val) {
        this.getUserList()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getDbList() {
      queryDBList().then(res => {
        this.dbList = res.data
      })
    },
    getUserList() {
      if(this.queryParams.DBName){
        getUserList(this.queryParams.DBName).then(res => {
          this.userList = res.data
        })
      }
    },
    // 显示弹框
    show() {
      this.getList()
      this.visible = true
      this.getDbList()
    },
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.tables = selection.map(item => item.tableName)
    },
    // 查询表数据
    getList() {
      listDbTable(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dbTableList = res.data
          this.total = res.total
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 导入按钮操作 */
    handleImportTable() {
      const tableNames = this.tables.join(',')
      if (tableNames == '') {
        this.$modal.msgError('请选择要导入的表')
        return
      }
      importTable({ tables: tableNames }).then(res => {
        this.$modal.msgSuccess(res.msg)
        if (res.code === 200) {
          this.visible = false
          this.$emit('ok')
        }
      })
    }
  }
}
</script>
