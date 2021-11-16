<template>
  <div class="containers bpmn-design-container" style="" v-loading="loading">
    <el-row v-show="!onlyViewFlag">
      <el-col>
        <div>
          <el-button class="app-icon app-icon-open" @click="deployWorkflow">部署</el-button>
          <el-button class="app-icon app-icon-open" @click="$refs.refFile.click()">导入xml</el-button>
          <el-button class="app-icon app-icon-save-as" @click="saveBPMN">导出xml</el-button>
          <el-button class="app-icon app-icon-save" @click="saveSVG">导出SVG</el-button>

          <el-button class="app-icon app-icon-save-as" @click="showXmlFlag=!showXmlFlag">展示XML</el-button>
          <el-button @click="handlerZoom(0.1)">放大</el-button>
          <el-button @click="handlerZoom(-0.1)">缩小</el-button>

          <span>当前xml适配：{{ camundaFlag ? 'camunda' : 'activiti' }}</span>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="showXmlFlag?16:24">
        <div class="row-height" style="position: relative;">
          <div class="canvas" ref="canvas" style="display: inline-block;" :style="{'width':showXmlFlag?'630px':'1075px'}"></div>
          <div id="js-properties-panel" class="panel" style="display: inline-block;width:240px;height: 600px;" v-show="!onlyViewFlag"></div>
          <input type="file" id="files" ref="refFile" v-show="false" @change="loadBPMN"/>
        </div>
      </el-col>
      <el-col :span="showXmlFlag?8:0" v-show="!onlyViewFlag">
        <div class="row-height">
          <codemirror ref="cmEditor" v-model="xmlStr" :value="xmlStr" :options="cmOptions" @changes="codeChange"/>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
//视图模式
// import BpmnViewer from 'bpmn-js'
//编辑模式
import bpmnModeler from 'bpmn-js/lib/Modeler'

//属性栏模块
import camundaPropertiesPanelModule from 'bpmn-js-properties-panel'
//属性栏
import camundaPropertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
//camunda描述文件
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'

import activitiPropertiesPanelModule from 'bpmn-js-properties-panel-activiti';
import activitiPropertiesProviderModule from 'bpmn-js-properties-panel-activiti/lib/provider/activiti';
import activitiModdleDescriptor from 'activiti-bpmn-moddle/resources/activiti.json';
//翻译模块
import customTranslate from '@/components/BpmnJs/customTranslate/customTranslate'
//bpmn-js lint 校验
import lintModule from 'bpmn-js-bpmnlint';
//bpmn-js lint 校验规则文件
import * as bpmnlintConfig from '/packed-config';
//令牌模拟
import tokenSimulation from 'bpmn-js-token-simulation/lib/modeler'
//小地图
import minimapModule from 'diagram-js-minimap'
//xml代码编辑器
import {codemirror} from 'vue-codemirror'
import {deploymentByXml, getProcessXmlByModelId} from "@/api/activiti/repository";

export default {
  name: 'BpmnDesign',
  components: {codemirror},
  data() {
    return {
      // bpmn建模器
      bpmnModeler: null,
      canvas: null,
      loading: false,
      camundaFlag: false,//是使用camunda,否则使用activiti
      onlyViewFlag: false,//仅显示主窗口标识
      miniMapOpenFlag: true,//小地图开关
      showXmlFlag: false,//xml编辑器开关
      scale: 1,//缩放比例
      xmlStr: null,//流程图xml保存的变量
      cmOptions: {//xml编辑器参数
        autoCloseTags: true,
        dragDrop: true,
        allowDropFileTypes: ['text/plain'],
        lineWrapping: true,
        lineNumbers: true,
        mode: {
          name: 'application/xml',
          htmlMode: false
        },
        tabSize: 2
      }
    }
  },
  mounted() {
    if (this.$route.query.modelId) {
      this.getProcessXmlByModelId(this.$route.query.modelId)
    } else {
      this.xmlStr = this.$route.query.xmlStr
      this.init()
    }
  },
  methods: {
    init() {
      // 获取到属性ref为“canvas”的dom节点
      const canvas = this.$refs.canvas
      //翻译模块
      var customTranslateModule = {
        translate: ['value', customTranslate]
      };
      var additionalModules = [
        //汉化
        customTranslateModule,
        // 实时校验流程图
        lintModule,
        //小地图
        minimapModule,
        //令牌模拟
        tokenSimulation
      ];
      var moddleExtensions = {}
      if (this.camundaFlag) {
        // // 左边工具栏以及节点
        additionalModules.push(camundaPropertiesProviderModule)
        // // 右边的工具栏
        additionalModules.push(camundaPropertiesPanelModule)
        moddleExtensions = {camunda: camundaModdleDescriptor}
      } else {
        // // 左边工具栏以及节点
        additionalModules.push(activitiPropertiesProviderModule)
        // // 右边的工具栏
        additionalModules.push(activitiPropertiesPanelModule)
        moddleExtensions = {activiti: activitiModdleDescriptor}
      }
      // 建模，官方文档这里讲的很详细
      this.bpmnModeler = new bpmnModeler({
        container: canvas,
        //添加控制板
        propertiesPanel: {
          parent: '#js-properties-panel'
        },
        linting: {
          bpmnlint: bpmnlintConfig,
          active: true
        },
        additionalModules: additionalModules,
        moddleExtensions: moddleExtensions,
        keyboard: {
          bindTo: window
        }
      });
      this.createNewDiagram();
    },
    async createNewDiagram() {
      // 将字符串转换成图显示出来
      await this.bpmnModeler.importXML(this.xmlStr).then((result) => {
        const {warnings} = result;
        if (warnings.length > 0) {
          var massages = "";
          warnings.forEach((msg) => {
            massages += msg.message + ';'
          })
          this.$message.error('加载流程图失败 !' + massages)
        } else {
          this.$message.success('加载流程图成功 !')
        }
        this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto');
        this.bpmnModeler.get('minimap').open()
        this.addListener()
      }).catch((err) => {
        const {warnings, message} = err;
        console.log('出错了:', warnings, message);
      });
    },
    addListener() {
      //添加监听,实时获取xml
      var that = this
      that.bpmnModeler.on('commandStack.changed', () => {
        that.getXml()
      })
    },
    handlerZoom(radio) {
      //放大缩小图形
      const newScale = !radio ? 1.0 : this.scale + radio
      this.bpmnModeler.get('canvas').zoom(newScale)
      this.scale = newScale
    },
    async getXml() {
      //获取xml
      const res = await this.bpmnModeler.saveXML({format: true})
      this.xmlStr = res.xml;
    },
    async saveBPMN() {
      //下载xml
      try {
        const result = await this.bpmnModeler.saveXML({format: true})
        const {xml} = result

        const xmlBlob = new Blob([xml], {
          type: 'application/bpmn20-xml;charset=UTF-8,'
        })

        const downloadLink = document.createElement('a')
        downloadLink.download = `bpmn-${+new Date()}.bpmn.xml`
        downloadLink.innerHTML = 'Get BPMN SVG'
        downloadLink.href = window.URL.createObjectURL(xmlBlob)
        downloadLink.onclick = function (event) {
          document.body.removeChild(event.target)
        }
        downloadLink.style.visibility = 'hidden'
        document.body.appendChild(downloadLink)
        downloadLink.click()
      } catch (err) {
        console.log(err)
      }
    },
    async loadBPMN() {
      //外部导入加载bpmn规范的xml
      const file = this.$refs.refFile.files[0]
      const reader = new FileReader()
      this.xmlStr = reader.readAsText(file)
      this.createNewDiagram()
    },
    async saveSVG() {
      //保存为svg
      try {
        const result = await this.bpmnModeler.saveSVG()
        const {svg} = result
        const svgBlob = new Blob([svg], {
          type: 'image/svg+xml'
        })
        const downloadLink = document.createElement('a')
        downloadLink.download = `bpmn-${+new Date()}.SVG`
        downloadLink.innerHTML = 'Get BPMN SVG'
        downloadLink.href = window.URL.createObjectURL(svgBlob)
        downloadLink.onclick = function (event) {
          document.body.removeChild(event.target)
        }
        downloadLink.style.visibility = 'hidden'
        document.body.appendChild(downloadLink)
        downloadLink.click()

      } catch (err) {
        console.log(err)
      }
    },
    codeChange(instance) {
      //实时将用户直接修改的xml加载到图形化界面上
      if (instance.getValue() == this.xmlStr) {
        return
      }
      this.xmlStr = instance.getValue()
      this.createNewDiagram();
    },
    deployWorkflow() {
      deploymentByXml({xmlStr: this.xmlStr}).then(res => {
        if (res.data.success) {
          this.$message.success("部署成功！")
        }else {
          this.$message.error("部署失败！"+res.data.msg)
        }
      })
    },
    getProcessXmlByModelId(modelId) {
      this.loading = true
      getProcessXmlByModelId({modelId: modelId}).then(res => {
        this.loading = false
        this.xmlStr = res.data.xmlStr
        this.init()
      })
    }
  },
  watch: {
    showXmlFlag: {
      handler() {
        //实时调整图形位置,防止切换双视图的时候造成的图形位置偏差
        if(this.bpmnModeler){
          setTimeout(() => {
            this.bpmnModeler.get('canvas').zoom(1);
            this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto');
          })
        }
      },
      deep: true,
      immediate: true
    },
  }
}
</script>

<style lang="scss">
.bpmn-design-container {

}

.containers {
  position: absolute;
  background-color: #ffffff;
  width: 100%;
  height: 100%;
}

.canvas {
  height: 100%;
}

.row-height {
  height: 600px;
}

.CodeMirror {
  height: 100% !important;
}

.vue-codemirror {
  height: 100% !important;
}

.panel {
  position: absolute;
  right: 10px;
  overflow-y: auto;
  top: 0;
}

.djs-minimap {
  position: absolute;
  top: 0;
  right: 0;
}

.bpp-properties {
  width: 90%;
}

</style>

