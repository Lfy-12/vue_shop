<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-row>

      <!-- 表格 -->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      :current-page="queryInfo.pagenum"
                      :page-sizes="[3, 5, 10, 15]"
                      :page-size="queryInfo.pagesize"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" ref="" @close="addCateDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：" >
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed"> 
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return{
      // 商品分类数据列表的查询条件
      queryInfo:{
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total:0,
      // 为table指定列的定义
      columns:[
        {label:'分类名称', prop:'cat_name'},
        // type表示将当前定义为模版列，template表示当前这一列使用模版咧
        {label:'是否有效', type:'template',template:'isok'},
        {label:'排序', type:'template',template:'order'},
        {label:'操作', type:'template',template:'opt'}
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible:false,
      // 添加分类的表单数据对象
      addCateForm:{
        // 将要添加的分类名称
        cat_name:'',
        // 父级分类的id
        cat_pid:0,
        // 分类的等级，默认要添加的是1级分类
        cat_level:0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name:[
          { required:true, message:'请输入分类名称',trigger:'blur'}
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 配置级联选择器的配置对象
      cascaderProps: {
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      // 选中的父级分类的id数组
      selectedKeys:[],
      // 查询到的商品分类对象
      editForm:'',
      // 控制编辑分类对话框的显示与隐藏
      editDialogVisible: false,
      // 添加表单的验证规则对象
      editFormRules: {
        cat_name: [
          {required: true,message: '请输入分类名称',trigger: 'blur'},
          {min: 1,max: 16,message: '分类名称的长度在3~16个字符之间',trigger: 'blur'}
        ],
      },
      // 保存已选中的分类ID值
      cateId:'',
      
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const {data:res} = await this.$http.get('categories',{params:this.queryInfo})
      if(res.meta.status !== 200){
        return this.$message.error('获取商品分类失败')
      }
      // console.log(res.data)
      // 把数据列表 赋值给 catalist
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮 展示添加分类的对话框
    showAddCateDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const {data:res} = await this.$http.get('categories',{
        params:{type:2}})
        if(res.meta.status !== 200) {
          return this.$message.error('获取父级分类的数据失败')
        }
        console.log(res.data)
        this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      // console.log(this.selectedKeys)
      // 如果selectKeys数据中的length大于0，证明选中了父级分类
      // 反之，就说明没有选中任何父级分类
      if(this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addCate () {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status !== 201){
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示编辑分类的对话框
    async showEditDialog (cate) {
      this.cateId = cate.cat_id
      const {data:res} = await this.$http.get('categories/'+cate.cat_id)
      console.log(res)
      if(res.meta.status !== 200){
        return this.$message.error('获取数据失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 点击确定按钮，编辑修改分类
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.put('categories/'+this.cateId,{cat_name:this.editForm.cat_name})
        if(res.meta.status !== 200){
          return this.$message.error('更新分类失败')
        }
        this.$message.success('更新分类成功')
        this.getCateList()
        this.editDialogVisible = false
      })
    },
    // 监听修改分类对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据id删除对应的商品分类信息
    async removeCateById (cate) {
      const confirmResult =await this.$confirm('此操作将永久删除该商品分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消该操作')
      }
      const {data:res} = await this.$http.delete('categories/'+cate.cat_id)
      if(res.meta.status !== 200){
        return this.$message.error('删除商品分类失败')
      }
      this.$message.success('删除商品分类成功')
      this.getCateList()
      this.editDialogVisible = false
    }

  }
}
</script>

<style lang="less" scoped>
  .treeTable{
    margin-top: 15px;
  }
  .el-cascader{
    width:100%;
  }
  
</style>


