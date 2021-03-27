import Vue from 'vue'
import { Button, Form, FormItem, Input, Message, container, header, aside, main, menu, submenu, MenuItem, breadcrumbItem, breadcrumb, card, row, col, table, tableColumn, Switch, tooltip, pagination, dialog, MessageBox, tag, tree, select, option, Cascader, alert, Tabs, tabPane} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(container)
Vue.use(header)
Vue.use(aside)
Vue.use(main)
Vue.use(menu)
Vue.use(submenu)
Vue.use(MenuItem)
Vue.use(breadcrumbItem)
Vue.use(breadcrumb)
Vue.use(card)
Vue.use(row)
Vue.use(col)
Vue.use(table)
Vue.use(tableColumn)
Vue.use(Switch)
Vue.use(tooltip)
Vue.use(pagination)
Vue.use(dialog)
Vue.use(tag)
Vue.use(tree)
Vue.use(select)
Vue.use(option)
Vue.use(Cascader)
Vue.use(alert)
Vue.use(Tabs)
Vue.use(tabPane)



Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm