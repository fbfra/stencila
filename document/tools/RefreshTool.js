import Tool from 'substance/packages/tools/Tool'

function RefreshTool () {
  RefreshTool.super.apply(this, arguments)
}

RefreshTool.Prototype = function () {
  this.getTitle = function () {
    return 'Refresh computations; not yet implemented :('
  }
}

Tool.extend(RefreshTool)

export default RefreshTool

