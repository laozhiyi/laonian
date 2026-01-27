<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header__back" @tap="goBack">‹</view>
      <text class="header__title">{{ isEdit ? '编辑地址' : '添加地址' }}</text>
      <view class="header__save" @tap="handleSave">保存</view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <view class="form__item">
        <view class="form__label">收货人</view>
        <input
          class="form__input"
          v-model="form.name"
          placeholder="请输入收货人姓名"
          placeholder-class="form__placeholder"
        />
      </view>

      <view class="form__item">
        <view class="form__label">手机号码</view>
        <input
          class="form__input"
          v-model="form.phone"
          type="number"
          placeholder="请输入手机号码"
          placeholder-class="form__placeholder"
          maxlength="11"
        />
      </view>

      <view class="form__item">
        <view class="form__label">所在地区</view>
        <view class="form__picker" @tap="showPicker = true">
          <text v-if="form.province">{{ form.province }} {{ form.city }} {{ form.district }}</text>
          <text v-else class="form__placeholder">请选择省/市/区</text>
          <text class="form__picker-arrow">›</text>
        </view>
      </view>

      <view class="form__item">
        <view class="form__label">详细地址</view>
        <textarea
          class="form__textarea"
          v-model="form.detail"
          placeholder="请输入街道、门牌号等"
          placeholder-class="form__placeholder"
          :maxlength="200"
        />
      </view>

      <view class="form__item">
        <view class="form__label">地址标签</view>
        <view class="form__tags">
          <view
            class="form__tag"
            :class="{ 'form__tag--active': form.type === '' || form.type === undefined }"
            @tap="form.type = ''"
          >
            默认
          </view>
          <view
            class="form__tag"
            :class="{ 'form__tag--active': form.type === 'home' }"
            @tap="form.type = 'home'"
          >
            🏠 家
          </view>
          <view
            class="form__tag"
            :class="{ 'form__tag--active': form.type === 'company' }"
            @tap="form.type = 'company'"
          >
            🏢 公司
          </view>
          <view
            class="form__tag"
            :class="{ 'form__tag--active': form.type === 'school' }"
            @tap="form.type = 'school'"
          >
            🏫 学校
          </view>
        </view>
      </view>

      <view class="form__item form__item--switch">
        <view class="form__label">设为默认地址</view>
        <view
          class="form__switch"
          :class="{ 'form__switch--active': form.isDefault }"
          @tap="form.isDefault = !form.isDefault"
        >
          <view class="form__switch-circle" />
        </view>
      </view>
    </view>

    <!-- 删除按钮（编辑时显示） -->
    <view class="delete-btn" v-if="isEdit" @tap="handleDelete">
      <text>删除地址</text>
    </view>

    <!-- 底部保存按钮 -->
    <view class="save-bar">
      <view class="save-btn" @tap="handleSave">
        <text>保存地址</text>
      </view>
    </view>

    <!-- 地区选择器 -->
    <view class="picker-mask" v-if="showPicker" @tap="showPicker = false" />
    <view class="picker-popup" :class="{ 'picker-popup--show': showPicker }">
      <view class="picker-header">
        <view class="picker-cancel" @tap="showPicker = false">取消</view>
        <view class="picker-confirm" @tap="confirmPicker">确定</view>
      </view>
      <picker-view class="picker-view" :value="pickerValue" @change="onPickerChange">
        <picker-view-column>
          <view class="picker-item" v-for="item in provinces" :key="item">{{ item }}</view>
        </picker-view-column>
        <picker-view-column>
          <view class="picker-item" v-for="item in cities" :key="item">{{ item }}</view>
        </picker-view-column>
        <picker-view-column>
          <view class="picker-item" v-for="item in districts" :key="item">{{ item }}</view>
        </picker-view-column>
      </picker-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createAddress, updateAddress, deleteAddress, getLocalAddresses, PROVINCES } from '@/utils/address.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)

// ========== 表单数据 ==========
const form = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  type: '',
  isDefault: false
})

// ========== 编辑模式 ==========
const isEdit = ref(false)
const addressId = ref('')

// ========== 地区选择器 ==========
const showPicker = ref(false)
const pickerValue = ref([0, 0, 0])

// 模拟城市和区县数据
const cityData = {
  '北京': ['北京市'],
  '上海': ['上海市'],
  '天津': ['天津市'],
  '重庆': ['重庆市'],
  '河北': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
  '山西': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
  '内蒙古': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
  '辽宁': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
  '吉林': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边州'],
  '黑龙江': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
  '江苏': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
  '浙江': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  '安徽': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
  '福建': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
  '江西': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
  '山东': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
  '河南': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
  '湖北': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施州', '仙桃市', '潜江市', '天门市', '神农架林区'],
  '湖南': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西州'],
  '广东': ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  '广西': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
  '海南': ['海口市', '三亚市', '三沙市', '儋州市'],
  '四川': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝州', '甘孜州', '凉山州'],
  '贵州': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南州', '黔东南州', '黔南州'],
  '云南': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄州', '红河州', '文山州', '西双版纳州', '大理州', '德宏州', '怒江州', '迪庆州'],
  '陕西': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
  '甘肃': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏州', '甘南州'],
  '青海': ['西宁市', '海东市', '海北州', '黄南州', '海南州', '果洛州', '玉树州', '海西州'],
  '宁夏': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  '新疆': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉州', '博尔塔拉州', '巴音郭楞州', '阿克苏地区', '克孜勒苏州', '喀什地区', '和田地区', '伊犁州', '塔城地区', '阿勒泰地区'],
  '香港': ['香港'],
  '澳门': ['澳门'],
  '台湾': ['台北市', '高雄市', '台中市', '台南市', '新北市', '桃园市']
}

const districtsData = {
  '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '顺义区', '通州区', '大兴区', '房山区', '门头沟区', '昌平区', '平谷区', '密云区', '怀柔区', '延庆区'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
  '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区'],
  '重庆市': ['万州区', '涪陵区', '渝中区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '渝北区', '巴南区', '黔江区', '长寿区', '綦江区', '潼南区', '铜梁区', '大足区', '荣昌区', '璧山区', '梁平区', '城口县', '丰都县', '垫江县', '武隆区', '忠县', '开州区', '云阳县', '奉节县', '巫山县', '巫溪县', '石柱县', '秀山县', '酉阳县', '彭水县'],
  '广州市': ['荔湾区', '越秀区', '海珠区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区', '增城区'],
  '深圳市': ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区', '盐田区', '龙华区', '坪山区'],
  '成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区', '新都区', '温江区', '双流区', '郫都区', '新津区', '简阳市', '都江堰市', '彭州市', '邛崃市', '崇州市', '大邑县', '蒲江县'],
  '杭州市': ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '富阳区', '临安区', '桐庐县', '淳安县', '建德市'],
  '南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区', '六合区', '溧水区', '高淳区'],
  '武汉市': ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '东西湖区', '汉南区', '蔡甸区', '江夏区', '黄陂区', '新洲区']
}

const provinces = PROVINCES
const cities = computed(() => {
  const province = provinces[pickerValue.value[0]] || '北京'
  return cityData[province] || ['市辖区']
})
const districts = computed(() => {
  const cityList = cities.value
  const city = cityList[pickerValue.value[1]] || cityList[0] || '市辖区'
  return districtsData[city] || ['区/县']
})

// ========== 交互方法 ==========
const goBack = () => {
  uni.navigateBack()
}

const onPickerChange = (e) => {
  pickerValue.value = e.detail.value
}

const confirmPicker = () => {
  form.value.province = provinces[pickerValue.value[0]] || ''
  form.value.city = cities.value[pickerValue.value[1]] || ''
  form.value.district = districts.value[pickerValue.value[2]] || ''
  showPicker.value = false
}

const handleSave = async () => {
  // 验证
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return
  }
  if (!form.value.phone.trim() || !/^1\d{10}$/.test(form.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
    return
  }
  if (!form.value.province) {
    uni.showToast({ title: '请选择所在地区', icon: 'none' })
    return
  }
  if (!form.value.detail.trim()) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return
  }

  const data = {
    name: form.value.name.trim(),
    phone: form.value.phone.trim(),
    province: form.value.province,
    city: form.value.city,
    district: form.value.district,
    detail: form.value.detail.trim(),
    type: form.value.type,
    isDefault: form.value.isDefault
  }

  // 如果设为默认，需要先取消其他默认
  if (data.isDefault) {
    const list = getLocalAddresses()
    list.forEach(a => { a.isDefault = false })
    uni.setStorageSync('user_addresses', JSON.stringify(list))
  }

  try {
    if (isEdit.value) {
      await updateAddress(addressId.value, data)
      uni.showToast({ title: '保存成功', icon: 'success' })
    } else {
      await createAddress(data)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (err) {
    uni.showToast({ title: err.message || '保存失败', icon: 'none' })
  }
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该收货地址吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteAddress(addressId.value)
        uni.showToast({ title: '已删除', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0

  // 获取地址ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id

  if (id) {
    isEdit.value = true
    addressId.value = id
    // 加载地址数据
    const list = getLocalAddresses()
    const addr = list.find(a => a.id === id)
    if (addr) {
      form.value = { ...addr }
    }
  }
})
</script>

<style lang="scss" scoped>
$primary: #FF9000;
$text: #2B2B2B;
$sub: #7A7A7A;
$bg: #FFF9F3;

.page {
  min-height: 100vh;
  background: $bg;
}

/* 顶部导航 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  z-index: 100;
}

.header__back {
  font-size: 48rpx;
  color: #fff;
  padding: 0 8rpx;
}

.header__title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 48rpx;
}

.header__save {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

/* 表单 */
.form {
  padding: 24rpx;
  padding-top: 112rpx;
  padding-bottom: 140rpx;
}

.form__item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.form__label {
  font-size: 26rpx;
  color: $sub;
  margin-bottom: 16rpx;
}

.form__input {
  font-size: 30rpx;
  color: $text;
  height: 56rpx;
}

.form__placeholder {
  color: #bbb;
}

.form__textarea {
  width: 100%;
  height: 160rpx;
  font-size: 30rpx;
  color: $text;
  line-height: 1.5;
}

.form__picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 30rpx;
  color: $text;
}

.form__picker-arrow {
  font-size: 32rpx;
  color: $sub;
}

.form__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.form__tag {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  background: #f5f5f5;
  font-size: 26rpx;
  color: $sub;
}

.form__tag--active {
  background: rgba(255, 144, 0, 0.1);
  color: $primary;
}

.form__item--switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form__switch {
  width: 96rpx;
  height: 52rpx;
  background: #e8e8e8;
  border-radius: 26rpx;
  position: relative;
  transition: background 0.3s;
}

.form__switch--active {
  background: $primary;
}

.form__switch-circle {
  width: 44rpx;
  height: 44rpx;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.3s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.form__switch--active .form__switch-circle {
  transform: translateX(44rpx);
}

/* 删除按钮 */
.delete-btn {
  margin: 48rpx 24rpx;
  height: 88rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #ff3b30;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

/* 底部保存栏 */
.save-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.save-btn {
  height: 88rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

/* 地区选择器 */
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.picker-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.3s;
  z-index: 201;
}

.picker-popup--show {
  transform: translateY(0);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-cancel {
  font-size: 28rpx;
  color: $sub;
}

.picker-confirm {
  font-size: 28rpx;
  color: $primary;
  font-weight: 600;
}

.picker-view {
  height: 480rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: $text;
}
</style>
