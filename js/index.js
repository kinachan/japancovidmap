class CoronaMap {
  constructor() {
    this.loader = document.getElementById('loader');
    document.getElementById('graphSelect')
      .addEventListener('click', this.onGraphSelect);
    document.getElementById('graphLength')
      .addEventListener('change', this.onGraphLengthChange)

    this.prefectureMaster = new PrefectureMaster();

    this.getData().then(res => {
      this.data = res;
      this.areas = res.area;
      this.SvgReader = new SvgReader(this.areas, this.prefectureMaster, this);

      this.loader.classList.remove('is-active');
    });
  }
  getData = async () => {
    return await fetch('https://www.stopcovid19.jp/data/covid19japan.json')
      .then(resolve => resolve.json())
      .catch(reject => console.log(reject));
  }

  validateRender = (ev) => {
    const float = parseFloat(ev.target.value);
    const isSuccess = (
      float >= 5 && float <= 30
    ) && !Number.isNaN(float);
    
    const danger = document.getElementById('graphLength-danger');
    const success = document.getElementById('graphLength-success');    
    
    if (!isSuccess) {
      ev.target.classList.remove('is-primary');
      ev.target.classList.add('is-danger');

      if(!danger.classList.contains('show')) {
        danger.classList.add('show');
      }
      return 0;
    }
    ev.target.classList.add('is-primary');
    ev.target.classList.remove('is-danger');

    danger.classList.remove('show');
    success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 2000);

    return float;
  }

  onGraphSelect = (ev) => {
    const value = ev.target.value;
    this.SvgReader.updateYKey(value);
  }

  onGraphLengthChange = (ev) => {
    const result = this.validateRender(ev);
    if (result !== 0) {
      this.SvgReader.updateLength(result);
    }
  }

  getEmSize = (el) => {
    return Number(getComputedStyle(el, '').fontSize.match(/(\d+)px/)[1]);
  }
  
  toArray = (domtokenList) => {
    const arr = [];
    for (let token of domtokenList) {
      arr.push(token);
    }
    return arr;
  }

  compare = (key) => {
    return (a, b) => {
      if (a[key] < b[key]) {
        return -1;
      }
      if (a[key] > b[key]) {
        return 1;
      }
      return 0;
    }
  }

  getRange = (size, index, length) => {
    const remainder = size % 2 !== 0;
    const harf = parseInt(size / 2);

    const isMaxOver = index + harf > length - 1;
    const isMinOver = index - harf < 0;

    if (!isMaxOver && !isMinOver) {
      const min = remainder ? index - harf - 1: index - harf; 
      return {min, max: index + harf};
    }

    if (isMinOver) {
      return {min: 0, max: size}
    }

    if (isMaxOver) {
      return {min: length - 1 - size, max: length - 1}
    }
  } 

  generateFilterData = (item, yKey, size) => {
    const sortData = this.areas.sort(this.compare(yKey));
    const targetIndex = sortData.findIndex(x =>x.name === item.name);

    const range = this.getRange(size, targetIndex, sortData.length);
    const filterdData = this.areas.filter((_item, i) => i > range.min && i <= range.max);
    return filterdData;
  }
}


class SvgReader  {
  defaultColorHex = '#009688';
  hoverColorHex = '#ff0090';
  selectColorHex = '#002171';
  xTicks = 20;

  constructor(data, PrefectureMaster, CoronaMap) {
    this.PrefectureMaster = PrefectureMaster;
    this.CoronaMap = CoronaMap;
    this.allData = data;
    this.yKey = 'ncurrentpatients';
    this.xKey = 'name_jp';
    this.paddingWidth = 30;
    this.paddingHeight = 30;
    this.isModalOpen = false;
    this.dataLength = 5;

    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip-info');

    this.bindEvents();
    this.contents = {
      content: null,
      svg: null,
      position: {
        width: 0,
        height: 0
      },
      scale: {
        x: null,
        y: null,
      }
    }
  }

  bindEvents() {
    const d3js = d3.selectAll('.prefecture');
    d3js.on('mouseover', this.onMouseOver);
    d3js.on('mouseleave', this.onMouseLeave);
    d3js.on('click', this.onClick);
  }

  updateYKey = (key) => {
    if (this.yKey === 'ninspections') {
      this.paddingWidth = 60;
      this.paddingHeight = 60;
    } else {
      this.paddingWidth = 30;
      this.paddingHeight = 30;
    }
    this.yKey = key;
  }

  updateLength = (value) => {
    this.dataLength = value;
  }
  
  getD3SelectorByClass = (ev) => {
    const eventTarget = ev.target;
    const arr = this.CoronaMap.toArray(eventTarget.classList);
    return arr.map(x => `.${x}`).join('');
  }

  getD3SelectorById = (ev) => {
    const eventTarget = ev.target;
    return `#${eventTarget.id}`;
  }

  onMouseOver = (ev) => {
    const selector = this.getD3SelectorById(ev);

    const area = this.allData.find(x => x.name.toLowerCase() === ev.target.id);
    const target = d3.selectAll(selector);
    target.style('fill', this.hoverColorHex);
    this.createDetailTooltip(area, ev);
  }

  onMouseLeave = (ev) => {
    const selector = this.getD3SelectorById(ev);
    const target = d3.selectAll(selector);
    target.style('fill', this.defaultColorHex);
    this.tooltip.style('visibility', 'hidden');
  }

  getObjectFunction = (ev) => {
    const item = this.allData.find(x => x.name.toLowerCase() === ev.target.id);
    const data = this.CoronaMap.generateFilterData(item, this.yKey, this.dataLength);

    return {item, data};
  }

  onClick = (ev, getFunc = this.getObjectFunction) => {
    const {item, data} = getFunc(ev);
    
    if (!this.isModalOpen) {
      const selector = this.getD3SelectorById(ev);

      const target = d3.selectAll(selector);
      target.style('fill', this.hoverColorHex);
      this.modalShow();
    }
    this.contents = this.createSvg();
    this.createScales(data);
    this.renderGraph(data, item);
  }

  modalShow() {
    const modal = document.getElementById('modal');
    modal.classList.add('is-active');

    this.isModalOpen = true;

    const elements = document.querySelectorAll('.modal-background, button.modal-close');
    elements.forEach(e => {
      e.addEventListener('click', (ev) => {
        this.isModalOpen = false;
        modal.classList.remove('is-active')
      });
    });
  }

  isMatchObject = (d, item, key) => d[key] === item[key];

  createDetailTooltip(area, ev) {
    if (area == null) {
      console.log(ev.currentTarget.id);
    }
    const maps = this.PrefectureMaster.getMaps();
    const content = maps.reduce((prev, current) => {
      if (current.key === 'name_jp') return prev;

      const isHighlight = current.key === this.yKey;
      const addClass = isHighlight ? 'class="has-text-danger"': '';
      return prev + `<p ${addClass}>${current.label}: ${area[current.key]}</p>`
    }, '');
    const htmlContent = `
    <strong>${area.name_jp}</strong><br />${content}`;

    let top = ev.clientY + 100;
    let left = ev.clientX + 100;

    this.tooltip.styles({
      visibility: 'visible',
      top: `${top}px`,
      left: `${left}px`,
    })
    .html(htmlContent);

    if (top > window.innerHeight) {
      const tooltipHeight = parseInt(
        this.tooltip.style('height').replace('px', ''), 10
      );
      top = window.innerHeight - tooltipHeight;
      this.tooltip.styles({
        top: `${top}px`
      })
    }
    if (left > window.innerWidth) {
      const tooltipWidth = parseInt(
        this.tooltip.style('width').replace('px', ''), 10
      );
      left = window.innerWidth - tooltipWidth;
      this.tooltip.styles({
        left: `${left}px`
      })
    }
  }

  renderGraph = (data, item) => {
    const {position, scale} = this.contents;
    const {width, height} = position;

    //* グラフ描画 *//
    this.contents.svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => scale.x(d[this.xKey]))
      .attr('fill', (d) => 
        this.isMatchObject(d, item, this.xKey) ? this.hoverColorHex : this.defaultColorHex
      )
      .attr('y', (d) => scale.y(d[this.yKey]))
      .attr("width", scale.x.bandwidth())
      .attr("height", (d) => {
        return height - this.paddingHeight - scale.y(d[this.yKey]);
      })
      .on('mouseover',(ev, d) => {
        this.createDetailTooltip(d, ev);
        d3.select(ev.target)
          .attr('fill', this.selectColorHex);
      })
      .on('mouseleave',(ev, d) => {
        this.tooltip.style('visibility', 'hidden');
        const match = this.isMatchObject(d, item, this.xKey);
        d3.select(ev.target)
          .attr('fill', match ? this.hoverColorHex : this.defaultColorHex);
      })
      .on('click', (ev, d) => this.refreshGraph(ev, d))
  }

  refreshGraph = (ev, item) => {
    const getFunc = (_ev) => {
      const data = this.CoronaMap.generateFilterData(item, this.yKey, this.dataLength);
      return {item, data};
    }

    this.onClick(ev, getFunc);
  }

  createScales(data) {
    const {svg, position, content } = this.contents;

    const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip-info');

    const createSmallTooltip = (ev, d) => {
      let top = ev.clientY + 20;
      let left = ev.clientX + 20;
        tooltip.styles({
          visibility: 'visible',
          top: `${top}px`,
          left: `${left}px`,
      });
      tooltip.html(d[this.xKey]);
    }
    // const xTicks = data.length;
    const xScale = d3.scaleBand()
      .rangeRound([this.paddingWidth, position.width - this.paddingWidth])
      .padding(0.1)
      .domain(data.map(x => x[this.xKey]));

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d[this.yKey])])
      .range([position.height - this.paddingHeight, this.paddingHeight]);

    this.contents.scale.x = xScale;
    this.contents.scale.y = yScale;
  
    svg.append('g')
      .attr('transform', `translate(${0},${(position.height - this.paddingHeight)})`)
      .call(d3.axisBottom(xScale));

      // .on('mouseover', (e, d) => createSmallTooltip)
      // .on('mouseleave', (e, d) => tooltip.style('visibility', 'hidden'))

    svg.append('g') 
      .attr('transform', `translate(${this.paddingHeight}, ${0})`)
      .call(d3.axisLeft(yScale));
  }

  createSvg() {
    // SVGの準備
    const wrapper = d3.select('#graph-wrapper')
    wrapper.html('');
    const svg = wrapper.append('svg');

    const width = wrapper.node().clientWidth - this.paddingWidth;
    const height = wrapper.node().clientHeight - this.paddingHeight;

    svg.attr('width', width)
      .attr('height', height);

      return {
        content: wrapper,
        svg,
        position: {
          height,
          width,
        },
        scale: {
          x: null,
          y: null,
        }
      }
  }

  setupGraph(xKey, yKey, data) {

    
    const x = svg.append('g')
      .attr('class', 'axis axis-x');
    const y = svg.append('g')
      .attr('class', 'axis axis-y');
    
    const xScale = d3.scaleOrdinal()
      .domain(data.map(x =>x[xKey]))
      .range([this.paddingWidth, width]);

    const yScale = d3.scaleBand()
      .domain([
        d3.min(data.map(x =>x[yKey])),
        d3.max(data.map(x =>x[yKey]))
      ])
      .range([height, paddingHeight]);
  
    const axisx = d3
      .axisBottom(xScale)
      .ticks(this.xTicks)
      .tickFormat(xScale.domain());

    const axisy = d3.axisLeft(yScale);

    x.attr('transform', `translate(${0}, ${height})`)
      .call(axisx);
    y.attr('transform', `translate(${paddingHeight}, ${0})`)
      .call(axisy);

    return {
      content: wrapper,
      svg,
      position: {x: xScale, y: yScale},
      data,
    };
  }



  // ISO3155-2: "JP-01"
  // name: "Hokkaido"
  // name_jp: "北海道"
  // ncurrentpatients: 735 // 入院治療等を要する者
  // ndeaths: 660 // 死亡（累積）
  // nexits: 17469 // 退院又は療養解除となった者の数
  // nheavycurrentpatients: 10 // 重症
  // ninspections: 369291 // PCR検査実施人数
  // npatients: 18835 // 陽性者数
  // nunknowns: 29 // 確認中
  
  // https://upload.wikimedia.org/wikipedia/commons/5/5a/Prefectures_of_Japan_nallow_gray.svg
  // https://upload.wikimedia.org/wikipedia/commons/8/85/Regions_and_Prefectures_of_Japan_no_labels.svg
  // SVGがイケてないので、こっちに差し替え？

  // https://opendata.resas-portal.go.jp/docs/api/v1/index.html
  // resas api key: MGnwKdJXFa3aVAr2MPNpVC8sAAr74fmlunhLpGzv
}

const map = new CoronaMap();
