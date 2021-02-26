
class PrefectureMaster {
  constructor() {
    this.prefecture = [
      {
        "code": 1,
        "name": "北海道",
        "key": "Hokkaido"
      },
      {
        "code": 2,
        "name": "青森県",
        "key": "Aomori"
      },
      {
        "code": 3,
        "name": "岩手県",
        "key": "Iwate"
      },
      {
        "code": 4,
        "name": "宮城県",
        "key": "Miyagi"
      },
      {
        "code": 5,
        "name": "秋田県",
        "key": "Akita"
      },
      {
        "code": 6,
        "name": "山形県",
        "key": "Yamagata"
      },
      {
        "code": 7,
        "name": "福島県",
        "key": "Fukushima"
      },
      {
        "code": 8,
        "name": "茨城県",
        "key": "Ibaraki"
      },
      {
        "code": 9,
        "name": "栃木県",
        "key": "Tochigi"
      },
      {
        "code": 10,
        "name": "群馬県",
        "key": "Gunma"
      },
      {
        "code": 11,
        "name": "埼玉県",
        "key": "Saitama"
      },
      {
        "code": 12,
        "name": "千葉県",
        "key": "Chiba"
      },
      {
        "code": 13,
        "name": "東京都",
        "key": "Tokyo"
      },
      {
        "code": 14,
        "name": "神奈川県",
        "key": "Kanagawa"
      },
      {
        "code": 15,
        "name": "新潟県",
        "key": "Niigata"
      },
      {
        "code": 16,
        "name": "富山県",
        "key": "Toyama"
      },
      {
        "code": 17,
        "name": "石川県",
        "key": "Ishikawa"
      },
      {
        "code": 18,
        "name": "福井県",
        "key": "Fukui"
      },
      {
        "code": 19,
        "name": "山梨県",
        "key": "Yamanashi"
      },
      {
        "code": 20,
        "name": "長野県",
        "key": "Nagano"
      },
      {
        "code": 21,
        "name": "岐阜県",
        "key": "Gifu"
      },
      {
        "code": 22,
        "name": "静岡県",
        "key": "Shizuoka"
      },
      {
        "code": 23,
        "name": "愛知県",
        "key": "Aichi"
      },
      {
        "code": 24,
        "name": "三重県",
        "key": "Mie"
      },
      {
        "code": 25,
        "name": "滋賀県",
        "key": "Shiga"
      },
      {
        "code": 26,
        "name": "京都府",
        "key": "Kyoto"
      },
      {
        "code": 27,
        "name": "大阪府",
        "key": "Osaka"
      },
      {
        "code": 28,
        "name": "兵庫県",
        "key": "Hyogo"
      },
      {
        "code": 29,
        "name": "奈良県",
        "key": "Nara"
      },
      {
        "code": 30,
        "name": "和歌山県",
        "key": "Wakayama"
      },
      {
        "code": 31,
        "name": "鳥取県",
        "key": "Tottori"
      },
      {
        "code": 32,
        "name": "島根県",
        "key": "Shimane"
      },
      {
        "code": 33,
        "name": "岡山県",
        "key": "Okayama"
      },
      {
        "code": 34,
        "name": "広島県",
        "key": "Hiroshima"
      },
      {
        "code": 35,
        "name": "山口県",
        "key": "Yamaguchi"
      },
      {
        "code": 36,
        "name": "徳島県",
        "key": "Tokushima"
      },
      {
        "code": 37,
        "name": "香川県",
        "key": "Kagawa"
      },
      {
        "code": 38,
        "name": "愛媛県",
        "key": "Ehime"
      },
      {
        "code": 39,
        "name": "高知県",
        "key": "Kochi"
      },
      {
        "code": 40,
        "name": "福岡県",
        "key": "Fukuoka"
      },
      {
        "code": 41,
        "name": "佐賀県",
        "key": "Saga"
      },
      {
        "code": 42,
        "name": "長崎県",
        "key": "Nagasaki"
      },
      {
        "code": 43,
        "name": "熊本県",
        "key": "Kumamoto"
      },
      {
        "code": 44,
        "name": "大分県",
        "key": "Oita"
      },
      {
        "code": 45,
        "name": "宮崎県",
        "key": "Miyazaki"
      },
      {
        "code": 46,
        "name": "鹿児島県",
        "key": "Kagoshima"
      },
      {
        "code": 47,
        "name": "沖縄県",
        "key": "Okinawa"
      }
    ];

    this.jsonMaps = [{
      key: 'name_jp',
      label: '都道府県',
    }, {
      key: 'ncurrentpatients',
      label: '入院治療等を要する者',
    }, {
      key: 'ndeaths',
      label: '死亡',
    }, {
      key: 'nexits',
      label: '退院又は療養解除となった者の数',
    }, {
      key: 'nheavycurrentpatients',
      label: '重傷者',
    }, {
      key: 'ninspections',
      label: 'PCR検査実施人数',
    }, {
      key: 'npatients',
      label: '陽性者数',
    }, {
      key: 'nunknowns',
      label: '確認中'
    }]
  }

  get(key) {
    return this.prefecture.find(x =>x.key.toLowerCase() === key);
  }

  getMaps() {
    return this.jsonMaps;
  }
}
