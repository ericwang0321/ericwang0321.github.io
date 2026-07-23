# Image2 教学剖面图资产索引

生成日期：2026-05-21

## 图片清单

1. `01-ai-value-chain-loop.png`  
   用途：解释应用需求如何传导到模型、算力、半导体、能源与 IDC。

2. `02-gpu-server-cutaway.png`  
   用途：解释 AI 服务器内部的 CPU、GPU、HBM、SSD、NIC/DPU、电源和液冷。

3. `03-gpu-hbm-cowos-package.png`  
   用途：解释 GPU/ASIC、HBM、interposer、ABF substrate 和 CoWoS/2.5D 封装关系。

4. `04-scale-up-vs-scale-out-network.png`  
   用途：解释 Scale-up 的 NVLink/NVSwitch 和 Scale-out 的 InfiniBand/Ethernet/RoCE。

5. `05-optical-module-link.png`  
   用途：解释交换机、SerDes/DSP、可插拔光模块、光纤和 patch panel 的链路。

6. `06-cpo-vs-pluggable-optics.png`  
   用途：对比传统可插拔光模块与 CPO 的电连接长度和集成方式。

7. `07-ai-data-center-power-chain.png`  
   用途：解释电力从 PPA/电网到变电、UPS/BESS、PDU 和 GPU 机柜的路径。

8. `08-liquid-cooling-loop.png`  
   用途：解释冷板、manifold、CDU、设施侧水环路和 heat rejection。

9. `09-mining-site-to-ai-hpc-data-center.png`  
   用途：解释矿场/IDC 资产如何转成 AI/HPC 数据中心容量，适合 KEEL/HIVE/CLSK 这类公司。

10. `10-investment-indicators-dashboard.png`  
    用途：解释从 ARR、token、GPU 订单、HBM/CoWoS、光模块到 MW/PUE/租约的投研观察链。

11. `11-application-demand-workflow.png`  
    用途：解释应用层从业务痛点、AI Agent、模型 API 到工作流集成和付费反馈。

12. `12-model-platform-workflow.png`  
    用途：解释模型层从数据、tokenization、预训练、对齐到 API/RAG/Agent 应用。

13. `13-compute-infrastructure-workflow.png`  
    用途：解释算力层运行时链路。该图容易被读成严格硬件串行流程，当前 HTML 不再作为算力 workflow 主图。

14. `14-semiconductor-manufacturing-workflow.png`  
    用途：解释半导体制造层从芯片定义、EDA/IP、晶圆制造、HBM/基板并行、先进封装到测试交付。

15. `15-data-center-resource-workflow.png`  
    用途：解释能源与数据中心层从负荷预测、选址、PPA/并网、UPS/PDU 到高密机柜、冷却和 PUE 运营。

16. `16-training-vs-inference-paths.png`  
    用途：解释训练和推理在硬件瓶颈上的差异。

17. `17-dense-vs-moe-model-paths.png`  
    用途：解释 Dense 模型和 MoE 模型在 token flow、路由、通信和调度上的差异。

18. `18-ai-compute-technology-paths.png`  
    用途：解释 GPU 集群、云厂商 ASIC 和晶圆级系统三条算力技术路径。

19. `19-data-center-cooling-paths.png`  
    用途：解释风冷、冷板液冷和浸没式液冷三种数据中心冷却路径。

20. `20-compute-infrastructure-business-flow.png`  
    用途：解释算力基础设施业务主线，从需求定义、集群方案、部件采购、整柜集成、IDC 部署、云平台调度计量到可租用算力运营。

21. `21-hbm-stacking-bonding-roadmap.png`  
    用途：解释 HBM 堆叠层数增加时，DRAM die thinning、die-to-die bonding 和 TSV/bump pitch 的工艺演进。

22. `22-hbm-generations-ai-servers.png`  
    用途：解释 HBM1 到 HBM4 在层数、单 die 密度、stack 容量、I/O 速率、带宽和供应商上的代际变化。

23. `23-stored-vs-running-model.png`  
    用途：解释模型训练后作为权重、checkpoint、config、tokenizer 等资产保存在存储系统中，用户调用时再加载到 GPU/TPU HBM 中运行推理。

24. `24-gpu-vs-tpu-parallel-vs-systolic.png`  
    用途：解释 GPU 的可编程并行 tile 计算路径与 TPU 的 systolic array / tensor dataflow 路径差异。

25. `25-ai-chip-package-to-accelerator-board.png`  
    用途：解释 GPU/ASIC + HBM 封装如何通过 interposer、ABF substrate、BGA 焊球连接到 accelerator PCB，并展示 MLCC、VRM/PMIC、连接器、retimer/SerDes 的板级位置。

26. `26-ai-server-board-level-supply-chain.png`  
    用途：解释 AI 服务器板级供应链，从先进封装、PCB/CCL/MLCC/VRM/连接器，到 ODM/OEM 系统集成和 AI 服务器/整柜交付。

## 预览

- `contact-sheet.png`：前 10 张图的联系表预览。
- `contact-sheet-all.png`：19 张图的联系表预览，尚未包含第 20-24 张后续新增图。

## 使用建议

- 图片适合放在 HTML 的“视觉解释 / Visual explainer”模块。
- 图内文字不作为最终权威解释，正式页面应配中文/英文图注。
- 第 11、12、14、15、20 张适合放在每层 `Current layer workflow` 中，作为文字流程卡片前的视觉总图。
- 第 16-19 张适合补强模型、算力和能源层的技术路径分叉。
- 第 13 张保留为运行时链路备用素材；算力层主 workflow 优先使用第 20 张。
- 第 5、6、7、8、19 张最适合补强“光模块、CPO、机房供电、液冷”这些初学者最容易混淆的环节。
- 第 3、21、22 张组合使用，适合解释“AI 芯片封装结构 → HBM 堆叠工艺压力 → HBM 代际指标”的半导体制造层逻辑。
- 第 23 张适合放在模型与平台层，用于拆清“模型文件保存在哪里”和“用户请求运行在哪里”这两个概念。
- 第 24 张适合放在算力基础设施层，用于解释 GPU 与 TPU/云 ASIC 的底层计算原理差异，再承接服务器、网络和光互联图。
- 第 25、26 张适合放在算力基础设施层，用于承接“AI 服务器内部”图，补清 ABF、PCB、CCL、MLCC、VRM/PMIC、连接器和 retimer 等板级 BOM 与先进封装的边界。
