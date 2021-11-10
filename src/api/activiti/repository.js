import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function listCatgoryTree(params) {
  return request({
    url: '/activiti/repository/getCatgoryTree',
    method: 'post',
    data: params
  })
}

// 查询流程列表
export function listWorkFlow(params) {
  return request({
    url: '/activiti/repository/getFlowList',
    method: 'post',
    data: params
  })
}

// 建立流程模型
export function createProcess(params) {
  return request({
    url: '/activiti/repository/createProcess',
    method: 'post',
    data: params
  })
}
// 建立流程模型
export function deploymentByXml(params) {
  return request({
    url: '/activiti/repository/deploymentByXml',
    method: 'post',
    data: params
  })
}

// 建立流程模型
export function getProcessXmlByModelId(params) {
  return request({
    url: '/activiti/repository/getProcessXmlByModelId',
    method: 'post',
    data: params
  })
}
// 删除流程模型
export function deleteProcessDefind(params) {
  return request({
    url: '/activiti/repository/deleteProcessDefind',
    method: 'post',
    data: params
  })
}
