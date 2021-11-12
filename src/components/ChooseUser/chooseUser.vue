<template>
  <div>
    <el-card shadow="always">
      xzyh
    </el-card>
    <div style="padding-top: 20px;text-align: right;">
      <el-button type="primary" @click="submit">提交</el-button>
      <el-button type="warning" @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'chooseUser',
  data() {
    return {
      nextUserId: ''
    }
  },
  methods: {
    submit() {
      this.$emit('setUser', this.nextUserId)
      this.$emit('close')
    },
    cancel() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>

</style>
