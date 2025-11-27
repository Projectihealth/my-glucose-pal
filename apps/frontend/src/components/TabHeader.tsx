import React from "react";

interface TabHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /**
   * 对齐方式：左对齐或居中
   */
  align?: "left" | "center";
  /**
   * 额外的容器 className，方便调用方自定义间距等
   */
  className?: string;
  /**
   * 标题左侧可以插入一个自定义的头像 / 图标区域（例如 Profile 页的头像）
   */
  leadingContent?: React.ReactNode;
  /**
   * Header 下方的自定义内容（例如圆形进度条等）
   */
  children?: React.ReactNode;
}

export function TabHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
  leadingContent,
  children,
}: TabHeaderProps) {
  const isCentered = align === "center";

  return (
    <header
      className={`px-6 pt-8 pb-6 bg-white ${
        isCentered ? "text-center" : "text-left"
      } ${className}`}
    >
      <div
        className={`max-w-xl mx-auto ${
          isCentered ? "flex flex-col items-center" : "flex items-center"
        } gap-5`}
      >
        {leadingContent && (
          <div className={isCentered ? "" : "flex-shrink-0"}>{leadingContent}</div>
        )}

        <div className={isCentered ? "space-y-2" : "space-y-2 flex-1"}>
          {eyebrow && (
            <p className="text-xs tracking-[0.18em] uppercase text-[#5B7FF3]">
              {eyebrow}
            </p>
          )}

          <h1
            className="text-gray-900"
            style={{ fontSize: "24px", fontWeight: 700, lineHeight: 1.2 }}
          >
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>

      {children && (
        <div className={`mt-6 ${isCentered ? "max-w-xl mx-auto" : ""}`}>
          {children}
        </div>
      )}
    </header>
  );
}


