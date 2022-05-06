<template>
  <div>
    <!--  部门树-->
    <el-tree
      :data="deptTree"
      :props="defaultProps"
      :expand-on-click-node="false"
      ref="tree"
      lazy
      node-key="id"
      :load="getDeptTree"
      :highlight-current="true"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script>
import {getUserProfile} from "@/api/system/user";
import {getDept, getDeptByParentId, getDeptRootTree, listDept} from "@/api/system/dept";

export default {
  name: "deptTree",
  props: {
    defaultDeptId: {
      type: String
    },
    refresh: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    defaultDeptId(val, oldVal) {
      if (val !== oldVal) {
        this.choosedDeptId = val;
      }
    },
    refresh(val, oldVal) {
      if (val !== oldVal) {
        this.getRootDept()
      }
    }
  },
  data() {
    return {
      deptTree: [],
      userInfo: {},
      choosedDeptId: this.defaultDeptId,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
    }
  },
  methods: {
    getDeptTree(node, resolve) {
      getUserProfile().then(response => {
        this.userInfo = response.data
        if (node.level === 0) {
          //首次加载,根据角色进行初始化,不同的角色看到的根节点不一样
          getDept(this.userInfo.deptId).then(response => {
            let deptInfo = response.data
            let tmp = []
            tmp.push({label: deptInfo.deptName, id: deptInfo.deptId, leaf: false})
            resolve(tmp)
            this.deptTree = tmp;
          })
        } else {
          //加载子节点
          getDeptByParentId(node.data.id).then(response => {
            let tmp = []
            response.data.forEach(deptInfo => {
              tmp.push({label: deptInfo.deptName, id: deptInfo.deptId, leaf: false})
            })
            resolve(tmp)
          })
        }
      })

    },
    getRootDept() {
      getDept(this.userInfo.deptId).then(response => {
        let deptInfo = response.data
        let tmp = []
        tmp.push({label: deptInfo.deptName, id: deptInfo.deptId, leaf: false})
        this.deptTree = tmp;
      })
    },
    queryDeptByDeptName(deptName) {
      if (!deptName) {
        this.getRootDept()
      } else {
        listDept({deptName: deptName}).then(response => {
          let tmp = []
          response.data.forEach(deptInfo => {
            tmp.push({label: deptInfo.deptName, id: deptInfo.deptId, leaf: false})
          })
          this.deptTree = tmp;
        })
      }
    },
    handleNodeClick(data) {
      this.$emit('node-click', data)
    }
  }
}
</script>

<style scoped>

</style>
