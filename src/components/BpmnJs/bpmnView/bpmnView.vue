<template>
  <div class="containers" v-loading="loading">
    <el-row v-show="!onlyViewFlag">
      <el-col>
        <div>
          <el-button @click="handlerZoom(0.1)">放大</el-button>
          <el-button @click="handlerZoom(-0.1)">缩小</el-button>
          <span>当前xml适配：{{ camundaFlag ? 'camunda' : 'activiti' }}</span>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div class="row-height">
          <div class="canvas" ref="canvas" style="height: 400px;"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
//视图模式
import BpmnViewer from 'bpmn-js'

//camunda描述文件
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'
//翻译模块
import customTranslate from '@/components/BpmnJs/customTranslate/customTranslate'
//小地图
import minimapModule from 'diagram-js-minimap'
import MoveModule from 'diagram-js/lib/features/move'
import ModelingModule from 'bpmn-js/lib/features/modeling'
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas'
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll'
import { getProcessXmlByModelId, getHistoryTask } from '@/api/activiti/repository'

export default {
  name: 'bpmnView',
  props: {
    modelId: {
      type: String,
      require: true
    },
    processInstanceId: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      // bpmn建模器
      bpmnModeler: null,
      canvas: null,
      loading: false,
      camundaFlag: true,//是使用camunda,否则使用activiti
      onlyViewFlag: false,//仅显示主窗口标识
      miniMapOpenFlag: true,//小地图开关
      scale: 1,//缩放比例
      xmlStr: null//流程图xml保存的变量
    }
  },
  methods: {
    getProcessXmlByModelId(modelId) {
      if (!modelId) {
        return
      }
      this.loading = true
      getProcessXmlByModelId({ modelId: modelId }).then(res => {
        if (!res.data.success) {
          this.$message.error(res.data.msg)
        } else {
          this.loading = false
          this.xmlStr = res.data.xmlStr
          this.init()
        }
      })
    },
    init() {
      // 获取到属性ref为“canvas”的dom节点
      const canvas = this.$refs.canvas
      //翻译模块
      var customTranslateModule = {
        translate: ['value', customTranslate]
      }
      var additionalModules = [
        //汉化
        customTranslateModule,
        //小地图
        minimapModule,
        MoveModule, // 可以调整元素
        ModelingModule, // 基础工具 MoveModule、SetColor 等依赖于此
        MoveCanvasModule, // 移动整个画布
        ZoomScrollModule
      ]
      var moddleExtensions = {}
      if (this.camundaFlag) {
        moddleExtensions = { camunda: camundaModdleDescriptor }
      } else {
        moddleExtensions = { activiti: activitiModdleDescriptor }
      }
      // 建模，官方文档这里讲的很详细
      this.bpmnModeler = new BpmnViewer({
        container: canvas,
        moddleExtensions: moddleExtensions,
        additionalModules: additionalModules,
        keyboard: {
          bindTo: window
        }
      })
      this.createNewDiagram()
      this.addListener()
    },
    async createNewDiagram() {
      // 将字符串转换成图显示出来
      await this.bpmnModeler.importXML(this.xmlStr).then((result) => {
        const { warnings } = result
        if (warnings.length > 0) {
          var massages = ''
          warnings.forEach((msg) => {
            massages += msg.message + ';'
          })
          this.$message.error('加载流程图失败 !' + massages)
        } else {
          this.$message.success('加载流程图成功 !')
        }
        this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
        this.bpmnModeler.get('minimap').open()
      }).catch((err) => {
        const { warnings, message } = err
        console.log('出错了:', warnings, message)
      })
    },
    addListener() {
      this.bpmnModeler.on('shape.added', e => {
        var elementRegistry = this.bpmnModeler.get('elementRegistry')
        var shape = e.element ? elementRegistry.get(e.element.id) : e.shape
        debugger
        this.setColor(shape)
      })
    },
    setColor(node) {
      let modeling = this.bpmnModeler.get('modeling')
      modeling.setColor(node, {
        stroke: 'green',
        fill: 'yellow'
      })
    },
    handlerZoom(radio) {
      //放大缩小图形
      const newScale = !radio ? 1.0 : this.scale + radio
      this.bpmnModeler.get('canvas').zoom(newScale)
      this.scale = newScale
    },
    getHistoryTask() {
      getHistoryTask({ processInstanceId: this.processInstanceId }).then(res => {
        debugger
      })
    }
  },
  watch: {
    modelId: {
      handler() {
        this.getProcessXmlByModelId(this.modelId)
      },
      deep: true,
      immediate: true
    },
    processInstanceId: {
      handler() {
        this.getHistoryTask(this.processInstanceId)
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style lang="scss">

</style>

