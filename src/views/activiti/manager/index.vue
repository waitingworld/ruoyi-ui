<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--类型数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="catgoryName"
            placeholder="请输入类型名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="catgoryOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--流程数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="流程名称" prop="processDefinitionName">
            <el-input
              v-model="queryParams.processDefinitionName"
              placeholder="请输入流程名称"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="flowList" border>
          <el-table-column label="序号" align="center" type="index" width="50"/>
          <!--          <el-table-column label="编号" align="center" key="deploymentId" prop="deploymentId" v-if="columns[0].visible"/>-->
          <el-table-column label="流程名称" align="center" key="name" prop="name" v-if="columns[1].visible"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="流程类型" align="center" key="category" prop="category" v-if="columns[2].visible"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="流程版本" align="center" key="version" prop="version" v-if="columns[3].visible"
                           width="80"/>
          <el-table-column label="流程描述" align="center" key="description" prop="description" v-if="columns[4].visible"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[5].visible" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="部署时间" align="center" prop="deploymentTime" v-if="columns[6].visible" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.deploymentTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="editProcess(scope.row)"
              >修改
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="deleteProcessDefind(scope.row)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="createProcessParams" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="流程名称" prop="processName">
              <el-input v-model="createProcessParams.processName" placeholder="请输入流程名称"/>
            </el-form-item>
            <el-form-item label="流程key" prop="processKey">
              <el-input v-model="createProcessParams.processKey" placeholder="请输入流程定义key"/>
            </el-form-item>
            <el-form-item label="流程类型" prop="category">
              <el-input v-model="createProcessParams.category" placeholder="请输入流程类型"/>
            </el-form-item>
            <el-form-item label="流程描述" prop="description">
              <el-input type="textarea" v-model="createProcessParams.description" placeholder="请输入流程描述" maxlength="50"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {listCatgoryTree, listWorkFlow, createProcess, deleteProcessDefind} from "@/api/activiti/repository";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Manager",
  components: {Treeselect},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 流程表格数据
      flowList: null,
      // 是否显示弹出层
      open: false,
      // 弹出层标题
      title: "",
      // 类型树选项
      catgoryOptions: undefined,
      // 流程类型名称
      catgoryName: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        processDefinitionName: undefined,
        processDefinitionCategory: undefined
      },
      // 列信息
      columns: [
        {key: 0, label: `编号`, visible: true},
        {key: 1, label: `流程名称`, visible: true},
        {key: 2, label: `流程类型`, visible: true},
        {key: 3, label: `流程版本`, visible: true},
        {key: 4, label: `流程描述`, visible: true},
        {key: 5, label: `创建时间`, visible: true},
        {key: 6, label: `部署时间`, visible: true},
      ],
      //创建流程
      createProcessParams: {
        processName: undefined,
        processKey: undefined,
        category: undefined,
        description: undefined
      },
      rules: {
        processName: [
          {required: true, message: "流程名称不能为空(必须全中文)", trigger: "blur", pattern: /^[u4e00-\u9fa5]+$/}
        ],
        processKey: [
          {
            required: true,
            message: "流程Key不能为空(字母开头的字母、数字、_和-组合)",
            trigger: "blur",
            pattern: /^[a-zA-Z][A-Za-z0-9_\-]+$/ig
          }
        ],
        category: [
          {required: true, message: "流程类型不能为空", trigger: "blur"}
        ],
        description: [
          {required: true, message: "流程说明不能为空", trigger: "blur"}
        ]
      }
    };
  },
  watch: {
    // 根据名称筛选部门树
    catgoryName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList();
    this.getTreeSelect();
  },
  methods: {
    editProcess(processInfo) {
      this.$router.push({
        path: "bpmnDesign",
        query: {modelId: processInfo.modelId}
      });
    },
    /**
     * 查询用户列表 */
    getList() {
      this.loading = true;
      listWorkFlow(this.queryParams).then(response => {
          this.flowList = response.data.flowList;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    /**
     * 查询部门下拉树结构 */
    getTreeSelect() {
      listCatgoryTree({}).then(response => {
        this.catgoryOptions = response.data.catgory;
      });
    },
    /**
     * 筛选节点*/
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    /**
     * 节点单击事件*/
    handleNodeClick(data) {
      this.queryParams.processDefinitionCategory = data.id;
      this.getList();
    },
    /**
     * 取消按钮*/
    cancel() {
      this.reset();
    },
    /**
     * 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /**
     * 重置按钮操作 */
    resetQuery() {
      this.queryParams.processDefinitionCategory = undefined
      this.resetForm("queryForm");
      this.getTreeSelect();
      this.handleQuery();
    },
    /**
     * 添加新的流程
     */
    handleAdd() {
      this.title = '新建流程'
      this.open = true
    },
    submitForm() {
      createProcess(this.createProcessParams).then(response => {
        console.log(response)
        this.resetQuery()
        if (response.data.success) {
          this.open = false
          this.$router.push({
            path: "bpmnDesign",
            query: {xmlStr: response.data.xmlStr, createProcessParams: this.createProcessParams}
          });
        } else {
          this.$message.error(response.data.msg)
        }
      })
    },
    // 表单重置
    reset() {
      this.createProcessParams = {
        processName: undefined,
        processKey: undefined,
        category: undefined,
        description: undefined
      };
      this.resetForm("createProcessParams");
    },
    // 流程删除
    deleteProcessDefind(process) {
      debugger
      if (!process.deploymentId) {
        this.$message.error("当前流程未部署过，不能删除")
        return
      }
      this.$confirm('是否确认删除' + process.name + '流程?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        let params = {
          deploymentId: process.deploymentId
        }
        deleteProcessDefind(params).then(res => {
          if (res.success) {
            this.resetQuery()
            this.$message.success("删除成功")
          }
        })
      }).catch(() => {});

    }
  }
};
</script>
