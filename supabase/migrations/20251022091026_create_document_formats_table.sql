/*
  # 创建投标文件格式表

  1. 新建表
    - `document_formats`
      - `id` (uuid, primary key)
      - `company_id` (uuid) - 关联公司
      - `name` (text) - 格式名称
      - `header` (text) - 页眉内容
      - `footer` (text) - 页脚内容
      - `margin_top` (integer) - 上边距（毫米）
      - `margin_bottom` (integer) - 下边距（毫米）
      - `margin_left` (integer) - 左边距（毫米）
      - `margin_right` (integer) - 右边距（毫米）
      - `heading_styles` (jsonb) - 标题样式配置
      - `body_text_style` (jsonb) - 正文样式配置
      - `is_default` (boolean) - 是否为默认格式
      - `created_at` (timestamptz) - 创建时间
      - `updated_at` (timestamptz) - 更新时间

  2. 说明
    - 标题样式包含一至六级标题的完整格式配置
    - 每个样式包含：序号样式、字体、字号、缩进、行距、对齐方式、是否加粗
*/

CREATE TABLE IF NOT EXISTS document_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  name text NOT NULL,
  header text DEFAULT '',
  footer text DEFAULT '第 {page} 页 共 {total} 页',
  margin_top integer DEFAULT 25,
  margin_bottom integer DEFAULT 25,
  margin_left integer DEFAULT 30,
  margin_right integer DEFAULT 30,
  heading_styles jsonb DEFAULT '{
    "heading1": {"numberingStyle": "一、", "fontFamily": "宋体", "fontSize": 18, "indent": 0, "lineSpacing": 1.5, "alignment": "center", "bold": true},
    "heading2": {"numberingStyle": "（一）", "fontFamily": "宋体", "fontSize": 16, "indent": 0, "lineSpacing": 1.5, "alignment": "left", "bold": true},
    "heading3": {"numberingStyle": "1.", "fontFamily": "宋体", "fontSize": 15, "indent": 0, "lineSpacing": 1.5, "alignment": "left", "bold": true},
    "heading4": {"numberingStyle": "（1）", "fontFamily": "宋体", "fontSize": 14, "indent": 0, "lineSpacing": 1.5, "alignment": "left", "bold": false},
    "heading5": {"numberingStyle": "①", "fontFamily": "宋体", "fontSize": 14, "indent": 0, "lineSpacing": 1.5, "alignment": "left", "bold": false},
    "heading6": {"numberingStyle": "a.", "fontFamily": "宋体", "fontSize": 14, "indent": 0, "lineSpacing": 1.5, "alignment": "left", "bold": false}
  }'::jsonb,
  body_text_style jsonb DEFAULT '{
    "numberingStyle": "1.",
    "fontFamily": "宋体",
    "fontSize": 14,
    "indent": 2,
    "lineSpacing": 1.5,
    "alignment": "left",
    "bold": false
  }'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_formats_company_id ON document_formats(company_id);
CREATE INDEX IF NOT EXISTS idx_document_formats_is_default ON document_formats(company_id, is_default);
