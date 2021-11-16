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

// 获取流程xml
export function getProcessXmlByModelId(params) {
  return request({
    url: '/activiti/repository/getProcessXmlByModelId',
    method: 'post',
    data: params
  })
}

// 获取流程xml
export function getProcessXmlByProcessInstanceId(params) {
  return request({
    url: '/activiti/repository/getProcessXmlByProcessInstanceId',
    method: 'post',
    data: params
  })
}

// 建立流程模型
export function getHistoryTask(params) {
  return request({
    url: '/activiti/task/getHistoryTask',
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

// 获取代办列表
export function getTodoList(params) {
  return request({
    url: '/activiti/task/getTodoList',
    method: 'post',
    data: params
  })
}

// 获取已办列表
export function getDoneList(params) {
  return request({
    url: '/activiti/task/getDoneList',
    method: 'post',
    data: params
  })
}

// 启动流程
export function startProcess(params) {
  return request({
    url: '/activiti/process/startProcess',
    method: 'post',
    data: params
  })
}

// 完成节点
export function completeTask(params) {
  return request({
    url: '/activiti/task/completeTask',
    method: 'post',
    data: params
  })
}

// 获取下一个节点
export function getNextNode(params) {
  return request({
    url: '/activiti/task/getNextNode',
    method: 'post',
    data: params
  })
}
// 获取下一个节点
export function getTaskInfo(params) {
  return request({
    url: '/activiti/task/getTaskInfo',
    method: 'post',
    data: params
  })
}
