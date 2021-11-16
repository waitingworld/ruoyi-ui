<template>
  <div id="appDesigner" v-loading="loading">
    <my-process-designer
      :key="`designer-${reloadIndex}`"
      v-model="xmlString"
      v-bind="controlForm"
      keyboard
      ref="processDesigner"
      @element-click="elementClick"
      @init-finished="initModeler"
      @deploy-process="deployWorkflow"
    />
    <my-properties-panel :key="`penal-${reloadIndex}`" :bpmn-modeler="modeler" :prefix="controlForm.prefix"
                         class="process-panel"
    />

    <!-- demo config -->
    <div class="demo-control-bar">
      <div class="open-control-dialog" @click="controlDrawerVisible = true"><i class="el-icon-setting"></i></div>
    </div>
    <el-drawer :visible.sync="controlDrawerVisible" size="400px" title="偏好设置" append-to-body destroy-on-close>
      <el-form :model="controlForm" size="small" label-width="100px" class="control-form" @submit.native.prevent>
        <el-form-item label="流程ID">
          <el-input v-model="controlForm.processId" @change="reloadProcessDesigner"/>
        </el-form-item>
        <el-form-item label="流程名称">
          <el-input v-model="controlForm.processName" @change="reloadProcessDesigner"/>
        </el-form-item>
        <el-form-item label="流转模拟">
          <el-switch v-model="controlForm.simulation" inactive-text="停用" active-text="启用"
                     @change="reloadProcessDesigner"
          />
        </el-form-item>
        <el-form-item label="禁用双击">
          <el-switch v-model="controlForm.labelEditing" inactive-text="停用" active-text="启用"
                     @change="changeLabelEditingStatus"
          />
        </el-form-item>
        <el-form-item label="隐藏label">
          <el-switch v-model="controlForm.labelVisible" inactive-text="停用" active-text="启用"
                     @change="changeLabelVisibleStatus"
          />
        </el-form-item>
        <el-form-item label="流程引擎">
          <el-radio-group v-model="controlForm.prefix" @change="reloadProcessDesigner(true)">
            <el-radio label="camunda">camunda</el-radio>
            <el-radio label="flowable">flowable</el-radio>
            <el-radio label="activiti">activiti</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="工具栏">
          <el-radio-group v-model="controlForm.headerButtonSize">
            <el-radio label="mini">mini</el-radio>
            <el-radio label="small">small</el-radio>
            <el-radio label="medium">medium</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import translations from '@/components/BpmnJs/customTranslate/translations'
// 自定义渲染（隐藏了 label 标签）
import CustomRenderer from '@/components/BpmnJs/modules/custom-renderer'
// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from '@/components/BpmnJs/process-designer/plugins/content-pad'
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from '@/components/BpmnJs/process-designer/plugins/palette'
import xmlObj2json from '@/utils/xml2json'
// 自定义侧边栏
// import MyProcessPanel from "../package/process-panel/ProcessPanel";
import { deploymentByXml, getProcessXmlByModelId } from '@/api/activiti/repository'

export default {
  name: 'bpmnDesign',
  components: {},
  data() {
    return {
      xmlString: '',
      loading: false,
      modeler: null,
      reloadIndex: 0,
      controlDrawerVisible: false,
      translationsSelf: translations,
      controlForm: {
        processId: '',
        processName: '',
        simulation: true,
        labelEditing: false,
        labelVisible: false,
        prefix: 'activiti',
        headerButtonSize: 'mini',
        // additionalModel: []
        additionalModel: [CustomContentPadProvider, CustomPaletteProvider]
      },
      addis: {
        CustomContentPadProvider,
        CustomPaletteProvider
      }
    }
  },
  created() {
    if (this.$route.query.modelId) {
      this.getProcessXmlByModelId(this.$route.query.modelId)
    } else {
      setTimeout(()=>{
        this.xmlString = this.$route.query.xmlStr
      })
    }
  },
  methods: {
    deployWorkflow() {
      debugger
      deploymentByXml({ xmlStr: this.xmlString }).then(res => {
        if (res.data.success) {
          this.$message.success('部署成功！')
        } else {
          this.$message.error('部署失败！' + res.data.msg)
        }
      })
    },
    getProcessXmlByModelId(modelId) {
      this.loading = true
      getProcessXmlByModelId({ modelId: modelId }).then(res => {
        this.loading = false
        this.xmlString = res.data.xmlStr
      })
    },
    initModeler(modeler) {
      setTimeout(() => {
        this.modeler = modeler
        console.log(modeler)
      }, 10)
    },
    reloadProcessDesigner(deep) {
      this.controlForm.additionalModel = []
      for (let key in this.addis) {
        if (this.addis[key]) {
          this.controlForm.additionalModel.push(this.addis[key])
        }
      }
      this.reloadIndex += 1
      this.modeler = null // 避免 panel 异常
      if (deep) {
        this.xmlString = undefined
        this.$refs.processDesigner.processRestart()
      }
    },
    changeLabelEditingStatus(status) {
      this.addis.labelEditing = status ? { labelEditingProvider: ['value', ''] } : false
      this.reloadProcessDesigner()
    },
    changeLabelVisibleStatus(status) {
      this.addis.customRenderer = status ? CustomRenderer : false
      this.reloadProcessDesigner()
    },
    elementClick(element) {
      this.element = element
    }
  }
}
</script>

<style lang="scss">
#appDesigner {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: inline-grid;
  grid-template-columns: auto max-content;
}

.demo-control-bar {
  position: fixed;
  right: 8px;
  bottom: 8px;
  z-index: 1;

  .open-control-dialog {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 32px;
    background: rgba(64, 158, 255, 1);
    color: #ffffff;
    cursor: pointer;
  }
}

.info-tip {
  position: fixed;
  top: 40px;
  right: 500px;
  z-index: 10;
  color: #999999;
}

.control-form {
  .el-radio {
    width: 100%;
    line-height: 32px;
  }
}
</style>
