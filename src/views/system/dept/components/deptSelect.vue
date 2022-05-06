<template>
  <div>
    <div @click="openTree">
      <el-input v-model="deptName" placeholder="请选择部门" @keyup.enter.native="handleQuery">
        <i slot="suffix" class="el-input__icon " :class="showTree?'el-icon-caret-bottom':'el-icon-caret-left'"
           style="position: relative;">
          <div @click.stop="changeTreeShow" style="width: 100%;height: 100%;position: absolute;top: 0;z-index: 9999"></div>
        </i>
      </el-input>
    </div>
    <div style="" class="myScrollbar treeBox" v-show="showTree">
      <dept-tree ref="deptTree" :default-dept-id="defaultDeptId" :refresh="showTree" @node-click="nodeClick"/>
    </div>
  </div>
</template>

<script>
import DeptTree from "@/views/system/dept/components/deptTree";
import {getDept} from "@/api/system/dept";

export default {
  name: "deptSelect",
  components: {DeptTree},
  props: {
    defaultDeptId: {
      type: String
    }
  },
  data() {
    return {
      deptName: '',
      showTree: false
    }
  },
  watch: {
    defaultDeptId: {
      handler(val, oldVal) {
        if (val !== oldVal) {
          this.getDeptName(val);
        }
      },
      immediate: true
    }
  },
  methods: {
    changeTreeShow() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.showTree = !this.showTree
        })
      });
    },
    handleQuery() {
      this.$refs.deptTree.queryDeptByDeptName(this.deptName);
    },
    getDeptName(deptId) {
      if (deptId) {
        getDept(deptId).then(res => {
          this.deptName = res.data.deptName;
        });
      }
    },
    openTree() {
      this.showTree = true;
    },
    nodeClick(node) {
      this.showTree = false
      this.deptName = node.label
      this.$emit('setDept', node);
    }
  }
}
</script>

<style scoped>
.treeBox {
  max-height: 300px;
  overflow: auto;
  position: absolute;
  z-index: 999;
  width: 100%;
  border-radius: 0 0 8px 8px;
  border: 1px solid #e0e3e9;
  border-top: 0;
  margin-top: -4px;
}
</style>
