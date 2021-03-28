<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <!-- gutter是指栅格间间隔 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append"
                       icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表区 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" ></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="105px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="90px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间"
        width="180px">
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px" >
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>




      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>



  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query:'',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      // 商品列表总条数
      total:0,
      // 商品列表
      goodslist:[],
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表数据
    // get方法都要｛params：｝
    async getGoodsList(){
      const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
      // console.log(res)
      if(res.meta.status !== 200){
        return this.$message.error('获取商品列表失败')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
      // console.log(this.goodslist)
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize){
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听pagenum改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除商品
    async removeGoodById (GoodId) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消该操作')
      }
      const {data:res} = await this.$http.delete('goods/'+ GoodId)
      if(res.meta.status !== 200){
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 
    goAddpage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>

</style>

