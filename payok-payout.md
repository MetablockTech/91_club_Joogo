<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title langkey="payout_doc_title">PAYOK - Payout API DOC</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta content="Payout API DOC" name="description">
        <meta content="" name="author">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <link rel="shortcut icon" href="./public/images/favicon.ico">
        <style>
            body.loading {
                visibility: hidden
            }
        </style>
        <link rel="shortcut icon" href="favicon.ico?e599120fd20da13abd6d">
        <link href="css/core.css?e599120fd20da13abd6d" rel="stylesheet">
        <link href="css/payokdocumentpayoutdoc.css?e599120fd20da13abd6d" rel="stylesheet">
    </head>
    <body class="loading">
        <div id="detached-topbar-placeholder"></div>
        <div class="wrapper">
            <input class="d-none" value="dk" id="docsType">
            <div id="vertical-sidebar-placeholder"></div>
            <div id="detached-sidebar-placeholder"></div>
            <div class="content-page" id="contentPageBox">
                <div class="content" id="contentBox">
                    <div id="vertical-topbar-placeholder"></div>
                    <div id="horizontal-topbar-placeholder"></div>
                    <div class="container-fluid mt-4">
                        <div class="row navbar-menu-box">
                            <div class="col-12">
                                <div class="card c-card">
                                    <div class="card-body navbar-menu-sm pl-1 pr-1">
                                        <div class="form-row">
                                            <div class="left-width pr-0">
                                                <nav id="navbar-example3" class="navbar navbar-light pr-0">
                                                    <nav id="nav-pills3" class="nav nav-pills flex-column w-100">
                                                        <ul class="metismenu side-nav mm-show">
                                                            <li class="side-nav-item mm-active">
                                                                <a href="#item-1" class="nav-link active" aria-expanded="true">
                                                                    <span langkey="document_overview">文档概述</span>
                                                                    <span class="menu-arrow"></span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse mm-show" aria-expanded="false">
                                                                    <li>
                                                                        <a class="nav-link" href="#item-1-1">
                                                                            <span langkey="prod_means">生产资料</span>
                                                                        </a>
                                                                        <a class="nav-link" href="#item-1-2">
                                                                            <span langkey="protocol">通讯协议</span>
                                                                        </a>
                                                                        <a class="nav-link" href="#item-1-3">
                                                                            <span langkey="signature_rules">签名规则</span>
                                                                        </a>
                                                                        <a class="nav-link" href="#item-1-4">
                                                                            <span langkey="api_description">接口说明</span>
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-2" class="nav-link" aria-expanded="false">
                                                                    <span langkey="payout_an_order">代付下单</span>
                                                                    <span class="menu-arrow"></span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false">
                                                                    <a class="nav-link" href="#item-2-1">
                                                                        <span langkey="acc_enable_query">账户可用性查询</span>
                                                                    </a>
                                                                    <a class="nav-link" href="#item-2-2">
                                                                        <span langkey="initiate_remit">发起代付</span>
                                                                    </a>
                                                                    <a class="nav-link" href="#item-2-3">
                                                                        <span langkey="payout_order_query">代付订单查询</span>
                                                                    </a>
                                                                    <a class="nav-link" href="#item-2-4">
                                                                        <span langkey="payout_async_callback">代付异步回调通知</span>
                                                                    </a>
                                                                </ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-3" class="nav-link" aria-expanded="false">
                                                                    <span langkey="acc_balance_query">账户余额查询</span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false"></ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-4" class="nav-link" aria-expanded="false">
                                                                    <span langkey="error_info_list">错误码信息</span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false"></ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-5" class="nav-link" aria-expanded="false">
                                                                    <span langkey="country_code_list">国家编码列表</span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false"></ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-6" class="nav-link" aria-expanded="false">
                                                                    <span langkey="org_bank_list">机构(银行)列表</span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false"></ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-7" class="nav-link" aria-expanded="false">
                                                                    <span langkey="single_limit_list">单笔限额列表</span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false"></ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-8" class="nav-link" aria-expanded="false">
                                                                    <span langkey="org_personal_id">证件号</span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false"></ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-9" class="nav-link" aria-expanded="false">
                                                                    <span langkey="org_personal_type">证件类型</span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false"></ul>
                                                            </li>
                                                            <li class="side-nav-item">
                                                                <a href="#item-10" class="nav-link" aria-expanded="false">
                                                                    <span langkey="org_acc_type">账户类型</span>
                                                                </a>
                                                                <ul class="side-nav-child-level mm-collapse" aria-expanded="false"></ul>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                </nav>
                                            </div>
                                            <div class="right-width pl-0">
                                                <div data-spy="scroll" data-target="#navbar-example3" data-offset="1" class="scrollspy-example pr-2">
                                                    <h4 id="item-1">
                                                        <div class="content guide-nv c-title" langkey="document_overview">文档概述</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional scroll">
                                                            <p class="c-2" langkey="document_overview_des">本文的主要目标读者是支付系统合作方的技术实施人员，其中的部分内容也可供管理与业务人员参考； 请您在开始对接PAYOK产品和解决方案之前，务必先仔细阅读PAYOK的最新文档，其中包括开发人员指南、API参考和代码示例等内容。 通过阅读文档，您可以更好地了解PAYOK产品和解决方案的相关信息，从而提升对接效率和减少错误的发生；</p>
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th class="text-th" langkey="version_no">版本号</th>
                                                                            <th class="text-th" langkey="v_update_date">更新日期</th>
                                                                            <th class="text-th" langkey="v_release_notes">更新说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>3.1.19</td>
                                                                            <td>2026-05-20</td>
                                                                            <td>
                                                                                1、<span langkey="v_payout_api_upgrade_v3_6">接口从V3.5升级到V3.6</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.18</td>
                                                                            <td>2026-01-08</td>
                                                                            <td>
                                                                                1、<span langkey="v_add_south_korea">新增国家：韩国</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.17</td>
                                                                            <td>2025-12-10</td>
                                                                            <td>
                                                                                1、<span langkey="v_payout_api_co_add_acc">账户类型新增: Bre-B</span>
                                                                                <br>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.16</td>
                                                                            <td>2025-11-12</td>
                                                                            <td>
                                                                                1、<span langkey="v_payout_api_upgrade_v3_5">接口从V3.4升级到V3.5</span>
                                                                                <br>
                                                                                2、<span langkey="v_payout_api_add_param">账户余额查询中新增参数：totalBalance</span>
                                                                                <br>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.15</td>
                                                                            <td>2025-03-04</td>
                                                                            <td langkey="v_api_upgrade_v3_4">接口从3.3升级到V3.4</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.14</td>
                                                                            <td>2025-01-22</td>
                                                                            <td langkey="v_add_bangladesh">新增国家：孟加拉国</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.13</td>
                                                                            <td>2025-01-16</td>
                                                                            <td langkey="v_api_upgrade_tr">接口从V3.2升级到3.3</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.12</td>
                                                                            <td>2024-10-24</td>
                                                                            <td langkey="v_api_upgrade">接口从V3.1升级到V3.2</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.4</td>
                                                                            <td>2024-06-28</td>
                                                                            <td langkey="v_add_version_filed">接口从V3升级到V3.1，响应参数和对账文件新增transFeeRate,transFee,totalTransFee字段</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.3</td>
                                                                            <td>2023-12-04</td>
                                                                            <td langkey="v_add_country_india">新增国家：印度</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.2</td>
                                                                            <td>2023-08-10</td>
                                                                            <td langkey="v_add_colombia">新增哥伦比亚</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1.1</td>
                                                                            <td>2023-05-18</td>
                                                                            <td langkey="v_add_turkey">新增国家：土耳其</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.1</td>
                                                                            <td>2023-04-18</td>
                                                                            <td langkey="v_response_sign">响应参数增加签名</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>3.0</td>
                                                                            <td>2023-03-23</td>
                                                                            <td langkey="document_optimization">文档优化</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-1" id="item-1-1">
                                                                <span langkey="prod_means">生产资料</span>
                                                            </p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-2" langkey="prod_means_des">商户通过审核后，PAYOK将会自动发送生产资料信息至您的系统管理员邮箱，请您登录系统管理员邮箱查收； 如果没有收到可以联系平台提供；为了确保信息的安全性，请不要向其他人泄露邮件内容，以免给您带来任何潜在的损失；</p>
                                                            </div>
                                                            <p class="c-1" id="item-1-2">
                                                                <span langkey="protocol">通讯协议</span>
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <table class="table-text-left">
                                                                    <thead>
                                                                        <tr></tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td langkey="transfer_method">传输方式</td>
                                                                            <td langkey="transfer_method_des">为了确保交易的安全性，采用HTTPS协议进行数据传输，要求使用的TLS版本不低于1.2</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="submit_method">提交方式</td>
                                                                            <td langkey="submit_method_des">采用POST方法提交</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="data_format">数据格式</td>
                                                                            <td langkey="data_format_des">提交和返回数据都为application/json格式</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="character_encoding">字符编码</td>
                                                                            <td langkey="character_encoding_des">统一采用UTF-8字符编码</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="signature_algorithm">签名算法</td>
                                                                            <td langkey="signature_algorithm_des">SHA256WithRSA之后再base64加密</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="judgment_logic">判断逻辑</td>
                                                                            <td langkey="judgment_logic_des">在处理交易数据时，先判断业务返回，再判断交易状态的顺序进行处理；</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-1" id="item-1-3">
                                                                <span langkey="signature_rules">签名规则</span>
                                                                （SHA256WithRSA）
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <table class="table-text-left">
                                                                    <thead>
                                                                        <tr></tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td langkey="encryption_method">加密方式</td>
                                                                            <td>SHA256WithRSA</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="key_format">密钥格式</td>
                                                                            <td>PKCS8</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="signature_algorithm">签名算法</td>
                                                                            <td langkey="signature_algorithm_des">SHA256WithRSA之后再base64加密</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="pub_pri_key_len">公私钥长度</td>
                                                                            <td>
                                                                                <span langkey="pub_pri_fmt">2048</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div class="sectionOnePage">
                                                                <p class="c-3">
                                                                    <span langkey="generate_pub_pri_keys">生成公私钥</span>
                                                                </p>
                                                                <p class="c-2 text-red font-weight-bold" langkey="keys_note_001">1.商户需生成一对私钥和公钥，然后与PAYOK交换公钥，请商户小心保管以防止泄露；</p>
                                                                <p class="c-2 text-red font-weight-bold" langkey="keys_note_002">2.PAYOK不接收商户私钥，请不要发送商户私钥给PAYOK</p>
                                                                <p class="c-2 text-red font-weight-bold" langkey="keys_note_003">3.异步通知时使用PAYOK公钥验签</p>
                                                                <p class="c-2">
                                                                    <span langkey="use_openssl">建议使用openssl，参考文档：</span>
                                                                    <a href="https://www.openssl.org/source/" class="text-decoration-underline">https://www.openssl.org/source/</a>
                                                                </p>
                                                                <p class="c-2">
                                                                    <span langkey="keys_by_command">商户通过如下命令生成公私钥：</span>
                                                                </p>
                                                                <div class="code-wrapper">
                                                                    <pre class="pre-code" style="white-space:pre">
                                                                        <code>
                                                                            <span>
                                                                                <span class="code-key" langkey="pub_pri_format">#生成后的公私钥文件为pem格式，然后将换行符替换成空</span>
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key" langkey="private_key">#私钥</span>
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out private.key.pem</span>
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key" langkey="public_key">#公钥</span>
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">openssl rsa -in private.key.pem -pubout > public.key.pem</span>
                                                                            </span>
                                                                        </code>
                                                                    </pre>
                                                                    <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                    <div class="fa fa-clone">
                                                                        <img src="./public/images/copy.png" width="8%">
                                                                    </div>
                                                                </div>
                                                                <p class="c-2">
                                                                    <span langkey="command_above_after">执行完上述命令后，会生成两个文件private.key.pem和 public.key.pem，其中private.key.pem为私钥，在请求交易时签名报文，由商户自行保管；</span>
                                                                </p>
                                                                <p class="c-2" langkey="private_key_pem">private.key.pem的内容如下（示例）：</p>
                                                                <blockquote>MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDj1YMR5RBfvPvWAq0lvAJqZETjiOk6KessYp3hf4q025LvstqUtxC9JYoikna7ZM5BL/2GTpdJq80ZgAOwDQSmzCyRlc3e4vhaUtQpO5nUuI/uxaP6+gLuOW+VzJ053xlyqnkV/IL3hkiD76tUyehn1DjmeVZ4e/A9qgkBQcUTlddwsDikVBlHVVVguubXjIsK5V3zEJn0lha0PUXS032GfJSksc1cavuBO1rw7DY2Oh7np2P6YJ2coWLS+1iwVuqX2rT/P987EELEewP4ffx4zRx8Yd04cEFmOiYf1pW9B3JmkZLFdm+v3R4VSJEWBNIxJ74RM1ym3eplKAxGsj6HAgMBAAECggEBAJ9b6KHLpvhQJ5Y5qQKLzuS73bOJQBj+2Q/iqqvfmhWGv/AJGfqLUZn7d/NWntXUXLAb8SjQL+HH2V3MvMeXU3mXtlTeg3EzMKN87AkrNx4jOgm5FEmoNgSLCBGvXQntks8xjiBizvhzZKVkLmLQF08IkgQjOuhrSE7ZcBMA/egDxSJekuglDwoFaeHLwDeNHunBTJl6LoZaSQ/s6iR6v0Nx18rIzWpD2HhnqOgb//hI8gLsV6cfi2ZXFfZhae2PY2iMC+UNwecAlzsKUgcGKvhNGme7ryYe9/smjbxw4QqIQnKhXwuDz/Lo/8PcttOElLxFT/JJjmPwlgF3oYY13QECgYEA8vCJ8lJ9DI4g2j33a19hikhCQxHoU0kR00ivHMuQ5KICx372lYG3ibWOumatX8ZfGRUxUoxXRAYMuFQgDkJFRyv22rp3Znl4bdQn5ZkfVMSHN9J0BqkBC/DEwAQ8441RNUvIrHiTD22IlpKZe7vo/JuaUWZUJjk66/TOXHtSQBkCgYEA8BUVFtXFleMtOLSO7kVt+4oTHqlcxYzRpb3+9V+xjel5M9WTxGQ1zBB59LaJq+FgA4WgLypa6pPL/zewfQKc76+IxprHANDytweMUl6FEPjaHemxqg1BeFQjO4726Be2hgvXXZsOphi7APXhmSXzlCwO64ISxCh7cZrla4oxx58CgYEAomoZbz2iiFBEumMPFGOR7EbetcQ1E+kX168SEygs2A1P2luRMuaj85bDsu6OHiea0EQQ02UrujhpLJphS+cWNby4rgZXaNTwpExf1+mEvsEcvT8ffoxiPL9cahrrMh36Gq1tnZCGkJvj4vZjUguQecD1bFIDFALS14i0pbN0i5ECgYEAz2X3BPYBLX3GKBFa1B1oaH8cC0XVndcLmPmsEf7r3KNPj+a2M1c6XiHxqOQzxCb7Ea/S9EvLpI+vD7flH+ks96YVKzS0K1FWC6VapCGBJGtFyceDMlsnLrLIiP/07gTmKaB7GSMFIZmFmsvOasWtSVhSP0LrwUcTdM2R2TfVzxMCgYBhiPSpmx7Z7qRD9mFq2f8nFAsM8nWq9TTLHq2O47J/El71LRosyWYoSAiMA54S2lPveamIiAiQjbvWXKh2xn9BatKaCCQA7U8FmK+T0lBv5k69i6JE3+HupiVg6iE0gC4EMJtD1RmtT8wX5yXZJWnItNUNta0dZ+POI9Wsfz3xuQ==</blockquote>
                                                                <p class="c-2" langkey="public_key_pem">public.key.pem的内容如下（示例）：</p>
                                                                <blockquote>MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA49WDEeUQX7z71gKtJbwCamRE44jpOinrLGKd4X+KtNuS77LalLcQvSWKIpJ2u2TOQS/9hk6XSavNGYADsA0EpswskZXN3uL4WlLUKTuZ1LiP7sWj+voC7jlvlcydOd8Zcqp5FfyC94ZIg++rVMnoZ9Q45nlWeHvwPaoJAUHFE5XXcLA4pFQZR1VVYLrm14yLCuVd8xCZ9JYWtD1F0tN9hnyUpLHNXGr7gTta8Ow2Njoe56dj+mCdnKFi0vtYsFbql9q0/z/fOxBCxHsD+H38eM0cfGHdOHBBZjomH9aVvQdyZpGSxXZvr90eFUiRFgTSMSe+ETNcpt3qZSgMRrI+hwIDAQAB</blockquote>
                                                                <p class="c-2" langkey="platform_public_key" data-html="true">PAYOK给的公钥：platform-public.key.pem 的内容如下（示例，不能用做生产验证）</p>
                                                                <blockquote>MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnE85N/a/K9BceWgu8Tujpl6hrQ1bXCbftXDMLfoUpPKCG+LMaDNXeqlfQZc3ZCxSqpeIw7IbGAhqKCRUTkJPD05TN3nYRlwxVDn1K2rTafS/QZPdznoxmKRkRSVsXG8hzp6hsDGjQi6NtM3IkHeiRSuj6FdtqUNyxOoofY7jtJIRnhSnBHIEz9r6CWe7+RbnK17ahN+HOOI3ABHFA9qd8at9wsnYAmXV5bUFh+49+vGGjYf2toeNYPCJS5ZE3WPnDU+H6bMTG3wlrVpNfwCcV2YW4f4vwS68hZys/zi4rZyi038+76MlTOcz3I3GSBwWzz10cSvMyu1cm0JPf0mv9QIDAQAB</blockquote>
                                                                <p class="c-3">
                                                                    <span langkey="signature_rules">签名规则</span>
                                                                    （SHA256WithRSA）
                                                                </p>
                                                                <p class="c-2" langkey="signature_rules_des" data-html="true">
                                                                    将请求报文组成对象后转换成json string后,拼接(使用 &amp;)接口地址（查看<a href="#item-1-4" class="text-decoration-underline">“接口地址”</a>
                                                                    ），使用商户RSA私钥进行SHA256WithRSA签名，将签名获得的值放入http header中，key为sign。
                                                                </p>
                                                                <p class="c-2 text-red" langkey="signature_rules_note">注意：json string 是http请求body，PAYOK会原封不动进行验签。</p>
                                                                <p class="c-3">
                                                                    <span langkey="example_params">示例</span>
                                                                </p>
                                                                <p class="c-2">
                                                                    <span langkey="assume_request_params">假设传送的参数如下</span>
                                                                    :
                                                                </p>
                                                                <div>
                                                                    <div class="code-wrapper">
                                                                        <pre style="white-space:pre">
                                                                            <code>
                                                                                <span>{</span>
                                                                                <span>
                                                                                    <span class="code-key">"requestTime"</span>
                                                                                    :<span class="code-val">"2024-06-27T08:42:20.451Z"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"amount"</span>
                                                                                    :<span class="code-val">"20000.00"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"benificiaryAccountInfo"</span>
                                                                                    :{
                                                                                    <span class="code-val">
                                                                                        <span class="code-key">"number"</span>
                                                                                        :<span class="code-val">"0000000001"</span>
                                                                                        ,
      <span class="code-key">"holderName"</span>
                                                                                        :<span class="code-val">"Test"</span>
                                                                                        ,
      <span class="code-key">"orgName"</span>
                                                                                        :<span class="code-val">"Bank BCA"</span>
                                                                                        ,
      <span class="code-key">"orgCode"</span>
                                                                                        :<span class="code-val">"CENAIDJA"</span>
                                                                                        ,
      <span class="code-key">"orgId"</span>
                                                                                        :<span class="code-val">"014"</span>
                                                                                    </span>
                                                                                    },
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantId"</span>
                                                                                    :<span class="code-val">"010095"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"countryCode"</span>
                                                                                    :<span class="code-val">"IDN"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"currency"</span>
                                                                                    :<span class="code-val">"Rp"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"language"</span>
                                                                                    :<span class="code-val">"EN"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantOrderId"</span>
                                                                                    :<span class="code-val">"6010095DK_PAY1719477740451"</span>
                                                                                </span>
                                                                                <span>}</span>
                                                                            </code>
                                                                        </pre>
                                                                        <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                        <div class="fa fa-clone">
                                                                            <img src="./public/images/copy.png" width="8%">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p class="c-2">
                                                                    <span langkey="signed_message">带签名报文</span>
                                                                </p>
                                                                <div>
                                                                    <div class="code-wrapper">
                                                                        <pre style="white-space:pre">
                                                                            <code>
                                                                                <span>
                                                                                    <span class="code-key">curl --location 'https://api-domian.com/api-pay/remit/V3.5/account/inquiry' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'sign: </span>
                                                                                    <span class="code-key">isKl7JFKVEMeEh/pGwb/bpgRELcNn3veooRCMCQtjoGWR36Yq+8qaI2F8owpaNUNCcNyg7PX/PU/T5jH/GeejpXCrIhUwmEOIja8/Pw4RYyFjwzLzBCNnJYF1u1GZNtCCEh8zGKti2GZXf3NyUF5YfD0Q/bcO8kvKqrxtXb/biORH4/CeULFSzUvG/n3vHAAA9rlgBn51c8GuA+AGlEyWp9ntlCOy4N4A21faJZsBwudJBBRgBiZPVo6amZtZJHhWtg8UfHyYsXjokFwPN++vibd/XpeRDzhp5zvKh3y55cVveoX6YKTk00wYfLVyHg9yQymD+s52DTy3AE90DG3XA==' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'Content-Type: application/json' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--data '{</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"requestTime"</span>
                                                                                    :<span class="code-val">"2024-06-27T08:42:20.451Z"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"amount"</span>
                                                                                    :<span class="code-val">"20000.00"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"benificiaryAccountInfo"</span>
                                                                                    :{
                                                                                    <span class="code-val">
                                                                                        <span class="code-key">"number"</span>
                                                                                        :<span class="code-val">"0000000001"</span>
                                                                                        ,
      <span class="code-key">"holderName"</span>
                                                                                        :<span class="code-val">"Test"</span>
                                                                                        ,
      <span class="code-key">"orgName"</span>
                                                                                        :<span class="code-val">"Bank BCA"</span>
                                                                                        ,
      <span class="code-key">"orgCode"</span>
                                                                                        :<span class="code-val">"CENAIDJA"</span>
                                                                                        ,
      <span class="code-key">"orgId"</span>
                                                                                        :<span class="code-val">"014"</span>
                                                                                    </span>
                                                                                    },
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantId"</span>
                                                                                    :<span class="code-val">"010095"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"countryCode"</span>
                                                                                    :<span class="code-val">"IDN"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"currency"</span>
                                                                                    :<span class="code-val">"Rp"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"language"</span>
                                                                                    :<span class="code-val">"EN"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantOrderId"</span>
                                                                                    :<span class="code-val">"6010095DK_PAY1719477740451"</span>
                                                                                </span>
                                                                                <span>}'</span>
                                                                            </code>
                                                                        </pre>
                                                                        <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                        <div class="fa fa-clone">
                                                                            <img src="./public/images/copy.png" width="8%">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p class="c-2">
                                                                    <span langkey="signed_plaintext">签名明文</span>
                                                                </p>
                                                                <div>
                                                                    <div class="code-wrapper">
                                                                        <pre style="white-space:pre">
                                                                            <code>
                                                                                <span>{"requestTime":"2024-06-27T08:42:20.451Z","amount":"20000.00",
"benificiaryAccountInfo":{"number":"0000000001","holderName":"Test","orgName":"Bank BCA",
"orgCode":"CENAIDJA","orgId":"014"},"merchantId":"010095","countryCode":"IDN","currency":"Rp",
"language":"EN","merchantOrderId":"6010095DK_PAY1719477740451"}&/api-pay/remit/V3.5/account/inquiry
</span>
                                                                            </code>
                                                                        </pre>
                                                                        <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                        <div class="fa fa-clone">
                                                                            <img src="./public/images/copy.png" width="8%">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p class="c-1" id="item-1-4">
                                                                <span langkey="api_description">接口说明</span>
                                                            </p>
                                                            <p class="c-3" id="item-1-4-1">
                                                                <span langkey="api_list">接口列表</span>
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="api_name">接口名称</th>
                                                                            <th langkey="docs_api">接口</th>
                                                                            <th langkey="docs_remark">备注</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td langkey="acc_enable_query">账户可用性查询</td>
                                                                            <td>/api-pay/remit/V3.6/account/inquiry</td>
                                                                            <td langkey="acc_enable_query_des">校验账户-打款前必须先调用账户可以用性接口，通过接口返回的inquiryToken来调打款接口.</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="initiate_remit">发起代付</td>
                                                                            <td>/api-pay/remit/V3.6/order/create</td>
                                                                            <td langkey="request_remit">请求代付</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="payout_order_query">代付订单查询</td>
                                                                            <td>/api-pay/remit/V3.6/order/query</td>
                                                                            <td langkey="query_trans_status">查询交易状态</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="payout_acc_balance_query">代付账户余额查询</td>
                                                                            <td>/api-pay/remit/V3.6/balance/query</td>
                                                                            <td langkey="enable_balance_des">查询可用余额</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-2">
                                                                <span langkey="about_params_des"></span>
                                                            </p>
                                                            <p class="c-2">
                                                                1.<span langkey="params_des_001">支付接口域名和测试参数在合作后由PAYOK运营人员提供；</span>
                                                            </p>
                                                            <p class="c-2">
                                                                2.<span langkey="params_des_003">测试环境发起下单接口成功后，三分钟内会自动回调；</span>
                                                            </p>
                                                            <p class="c-2">
                                                                3.<span langkey="params_des_004">测试环境 商户只需要测试下单，查询，回调接口是否正常；</span>
                                                            </p>
                                                            <p class="c-3" id="item-1-4-2">
                                                                <span langkey="param_rules">传参规则</span>
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="is_required">是否必填</th>
                                                                            <th langkey="describe">描述</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>M</td>
                                                                            <td langkey="mandatory">必填（Mandatory）</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>O</td>
                                                                            <td langkey="optional">选填（Optional）</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>C</td>
                                                                            <td langkey="condition_required">特定条件下必填（Condition）</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-2">
                                                        <div class="content guide-nv c-title" langkey="payout_an_order">代付下单</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional">
                                                            <div class="sectionOnePage">
                                                                <p class="c-3 text-red" langkey="payout_order_illustrate">说明：</p>
                                                                <p class="c-3">
                                                                    1.<span langkey="order_illustrate_001">账户可用性接口主要目的是为了校验银行卡是否有效</span>
                                                                </p>
                                                                <p class="c-3">
                                                                    2.<span langkey="order_illustrate_002">打款前必须调用账户可以用性接口，通过接口返回的inquiryToken来调打款接口</span>
                                                                </p>
                                                            </div>
                                                            <p class="c-1" id="item-2-1" langkey="acc_enable_query">账户可用性查询</p>
                                                            <p class="c-3" id="item-2-1-1">
                                                                <span langkey="request_params">请求参数</span>
                                                            </p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-3">
                                                                    <span langkey="api_address">接口地址</span>
                                                                    ： <a href="#item-1-4" class="text-decoration-underline" langkey="click_api_lists">查看“接口说明”</a>
                                                                </p>
                                                            </div>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="rules_details_check">签名规则：详情查看</span>
                                                                                <a href="#item-1-3" class="text-decoration-underline text-red">
                                                                                    "<span langkey="signature_rules">签名规则</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table class="object-td-left">
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>requestTime</td>
                                                                            <td>String(24)</td>
                                                                            <td>M</td>
                                                                            <td langkey="request_times_des" data-html="true">
                                                                                发起请求时间，使用UTC时间（UTC +0）<br>
                                                                                格式（yyyy-MM-dd'T'HH:mm:ss.SSS'Z'）<br>例：2023-04-06T12:30:30.500Z
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_des">PAYOK提供给合作方的商户唯一标识</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantOrderId</td>
                                                                            <td>String(50)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_order_unique">商户系统内部的订单号,50个字符内、可包含字母, 确保在商户系统唯一</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>amount</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="dk_order_amounts_des" data-html="true">货币单位为对应国家的货币，小数两位</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>countryCode</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td langkey="country_codes_des">机构所在国家编码</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>currency</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="currency_des">货币代码详细可见</span>
                                                                                "<a href="#item-5" class="text-decoration-underline" langkey="country_code_list">国家编码列表</a>
                                                                                "
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>language</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="language_name_des">语言详细可见</span>
                                                                                "<a href="#item-5" class="text-decoration-underline" langkey="country_code_list">国家编码列表</a>
                                                                                "
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>+benificiaryAccountInfo</td>
                                                                            <td>Object</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_card_info_des">收款人的账户信息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「number</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_number_des">收款人所在机构(银行)帐号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_id_des">收款人机构(银行)ID, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgCode</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_code_des">收款人机构(银行)编码, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgName</td>
                                                                            <td>String(45)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="p_org_name_des">收款人所在机构(银行)名称, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「holderName</td>
                                                                            <td>String(200)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_holder_name_des">收款人所在机构(银行)户名</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalId</td>
                                                                            <td>String(12)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_id_des">收款人的证件号, 参考</span>
                                                                                <a href="#item-8" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_id">证件号</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalType</td>
                                                                            <td>String(10)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_type_des">收款人的证件类型, 参考</span>
                                                                                <a href="#item-9" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_type">证件类型</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「accountType</td>
                                                                            <td>String(10)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_acc_type_des">收款人的账户类型, 参考</span>
                                                                                <a href="#item-10" class="text-decoration-underline">
                                                                                    "<span langkey="org_acc_type">账户类型</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3" id="item-2-1-2">
                                                                <span langkey="response_params">响应参数</span>
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="response_sign_001">根据PAYOK返回的响应Body生成的签名；</span>
                                                                                <br>
                                                                                <span langkey="response_sign_002">接收到的签名请使用PAYOK公钥验签</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table class="object-td-left">
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>code</td>
                                                                            <td>String(1)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                SUCCESS：<span langkey="req_code_success">请求成功</span>
                                                                                ； FAIL：<span langkey="req_code_fail">请求失败</span>
                                                                                <span langkey="code_fail_des">具体错误原因可见字段: message</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>message</td>
                                                                            <td>String(128)</td>
                                                                            <td>O</td>
                                                                            <td langkey="response_code_err_des">当code返回FAIL时会返回详细的错误消息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td colspan="6" class="text-th" langkey="return_code_success" style="text-align:center!important">以下字段在code为SUCCESS时才有返回</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_des">PAYOK提供给合作方的商户唯一标识</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantOrderId</td>
                                                                            <td>String(50)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_order_unique">商户系统内部的订单号,50个字符内、可包含字母, 确保在商户系统唯一</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>amount</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="payout_amounts">代付金额</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>countryCode</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td langkey="country_codes_des">机构所在国家编码</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>currency</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="currency_des">货币代码详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>language</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="language_name_des">语言详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>inquiryToken</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>+benificiaryAccountInfo</td>
                                                                            <td>Object</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_card_info_des">收款人的账户信息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「number</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_number_des">收款人所在机构(银行)帐号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_id_des">收款人机构(银行)ID, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgCode</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_code_des">收款人机构(银行)编码, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgName</td>
                                                                            <td>String(45)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="p_org_name_des">收款人所在机构(银行)名称, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「holderName</td>
                                                                            <td>String(200)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_holder_name_des">收款人所在机构(银行)户名</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalId</td>
                                                                            <td>String(12)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_id_des">收款人的证件号, 参考</span>
                                                                                <a href="#item-8" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_id">证件号</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalType</td>
                                                                            <td>String(10)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_type_des">收款人的证件类型, 参考</span>
                                                                                <a href="#item-9" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_type">证件类型</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「accountType</td>
                                                                            <td>String(10)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_acc_type_des">收款人的账户类型, 参考</span>
                                                                                <a href="#item-10" class="text-decoration-underline">
                                                                                    "<span langkey="org_acc_type">账户类型</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3" id="item-2-1-3">
                                                                <span langkey="example_params">示例</span>
                                                            </p>
                                                            <p class="c-2">
                                                                <span langkey="request_params">请求参数</span>
                                                            </p>
                                                            <div>
                                                                <div class="code-wrapper">
                                                                    <pre style="white-space:pre">
                                                                        <code>
                                                                            <span>
                                                                                <span class="code-key">curl --location 'https://api-domian.com/api-pay/remit/V3.5/account/inquiry' \</span>
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">--header 'sign: </span>
                                                                                <span class="code-val">isKl7JFKVEMeEh/pGwb/bpgRELcNn3veooRCMCQtjoGWR36Yq+8qaI2F8owpaNUNCcNyg7PX/PU/T5jH/GeejpXCrIhUwmEOIja8/Pw4RYyFjwzLzBCNnJYF1u1GZNtCCEh8zGKti2GZXf3NyUF5YfD0Q/bcO8kvKqrxtXb/biORH4/CeULFSzUvG/n3vHAAA9rlgBn51c8GuA+AGlEyWp9ntlCOy4N4A21faJZsBwudJBBRgBiZPVo6amZtZJHhWtg8UfHyYsXjokFwPN++vibd/XpeRDzhp5zvKh3y55cVveoX6YKTk00wYfLVyHg9yQymD+s52DTy3AE90DG3XA==' \</span>
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">--header 'Content-Type: application/json' \</span>
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">--data '{</span>
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"requestTime"</span>
                                                                                :<span class="code-val">"2024-06-27T08:42:20.451Z"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"amount"</span>
                                                                                :<span class="code-val">"20000.00"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"benificiaryAccountInfo"</span>
                                                                                :{
                                                                                <span class="code-val">
                                                                                    <span class="code-key">"number"</span>
                                                                                    :<span class="code-val">"0000000001"</span>
                                                                                    ,
      <span class="code-key">"holderName"</span>
                                                                                    :<span class="code-val">"Test"</span>
                                                                                    ,
      <span class="code-key">"orgName"</span>
                                                                                    :<span class="code-val">"Bank BCA"</span>
                                                                                    ,
      <span class="code-key">"orgCode"</span>
                                                                                    :<span class="code-val">"CENAIDJA"</span>
                                                                                    ,
      <span class="code-key">"orgId"</span>
                                                                                    :<span class="code-val">"014"</span>
                                                                                </span>
                                                                                },
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"merchantId"</span>
                                                                                :<span class="code-val">"010095"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"countryCode"</span>
                                                                                :<span class="code-val">"IDN"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"currency"</span>
                                                                                :<span class="code-val">"Rp"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"language"</span>
                                                                                :<span class="code-val">"EN"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"merchantOrderId"</span>
                                                                                :<span class="code-val">"6010095DK_PAY1719477740451"</span>
                                                                            </span>
                                                                            <span>}'</span>
                                                                        </code>
                                                                    </pre>
                                                                    <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                    <div class="fa fa-clone">
                                                                        <img src="./public/images/copy.png" width="8%">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p class="c-3">
                                                                <span langkey="response_params">响应参数</span>
                                                            </p>
                                                            <p class="c-3">Header:</p>
                                                            <div class="code-wrapper code-header">
                                                                <pre style="white-space:pre">
                                                                    <code>
                                                                        <span>
                                                                            <span class="code-key">sign</span>
                                                                            :<span class="code-val">atHox09hnzDCPDfV1QKAx2P4xFH51DG50vDixJQNCi3w/Qr7FAnWSotBtiYeC6VjqW+OcsCwpDJaktEYjDoMLCWnyr7j+KX490aymOy9RZ4Nw1soBH0zok/BFVLh8rawwXy9EivHfnHczo8y2rwY4iYedyBO/mQ/fuszAuPGg3du+8hPZRuZVW+Dgx1eYfaHO64M1wo9SDUZyIXG5+/jqEI8jUA80wCSooXcwe1XLJnpkYvVkZAwBfxfeQ9spSOTtHN1LLw0N62+8U2eeFziwXTzSIcT3T1bVGMJ/6ZKsKD0ymp7o4SZOV6gvVqPEGV2AKvlmTXqdSuKjgWrp8/qWA==</span>
                                                                        </span>
                                                                    </code>
                                                                </pre>
                                                                <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                <div class="fa fa-clone">
                                                                    <img src="./public/images/copy.png" width="8%">
                                                                </div>
                                                            </div>
                                                            <p class="c-3">Body:</p>
                                                            <div class="code-wrapper">
                                                                <pre style="white-space:pre">
                                                                    <code>
                                                                        <span>{</span>
                                                                        <span>
                                                                            <span class="code-key">"inquiryToken"</span>
                                                                            :<span class="code-val">"2024062709590000008"</span>
                                                                            ,
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"amount"</span>
                                                                            :<span class="code-val">20000</span>
                                                                            ,
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"benificiaryAccountInfo"</span>
                                                                            :{
                                                                            <span class="code-val">
                                                                                <span class="code-key">"number"</span>
                                                                                :<span class="code-val">"0000000001"</span>
                                                                                ,
      <span class="code-key">"holderName"</span>
                                                                                :<span class="code-val">"Test"</span>
                                                                                ,
      <span class="code-key">"orgName"</span>
                                                                                :<span class="code-val">"Bank BCA"</span>
                                                                                ,
      <span class="code-key">"orgCode"</span>
                                                                                :<span class="code-val">"CENAIDJA"</span>
                                                                                ,
      <span class="code-key">"orgId"</span>
                                                                                :<span class="code-val">"014"</span>
                                                                            </span>
                                                                            },
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"countryCode"</span>
                                                                            :<span class="code-val">"IDN"</span>
                                                                            ,
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"code"</span>
                                                                            :<span class="code-val">"SUCCESS"</span>
                                                                            ,
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"merchantId"</span>
                                                                            :<span class="code-val">"010095"</span>
                                                                            ,
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"currency"</span>
                                                                            :<span class="code-val">"Rp"</span>
                                                                            ,
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"language"</span>
                                                                            :<span class="code-val">"EN"</span>
                                                                            ,
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"merchantOrderId"</span>
                                                                            :<span class="code-val">"6010095DK_PAY1719477740451"</span>
                                                                            ,
                                                                        </span>
                                                                        <span>
                                                                            <span class="code-key">"message"</span>
                                                                            :<span class="code-val">"SUCCESS"</span>
                                                                        </span>
                                                                        <span>}</span>
                                                                    </code>
                                                                </pre>
                                                                <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                <div class="fa fa-clone">
                                                                    <img src="./public/images/copy.png" width="8%">
                                                                </div>
                                                            </div>
                                                            <p class="c-1" id="item-2-2" langkey="initiate_remit">发起代付</p>
                                                            <p class="c-3" id="item-2-2-1">
                                                                <span langkey="request_params">请求参数</span>
                                                            </p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-3">
                                                                    <span langkey="api_address">接口地址</span>
                                                                    ： <a href="#item-1-4" class="text-decoration-underline" langkey="click_api_lists">查看“接口说明”</a>
                                                                </p>
                                                            </div>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="rules_details_check">签名规则：详情查看</span>
                                                                                <a href="#item-1-3" class="text-decoration-underline text-red">
                                                                                    "<span langkey="signature_rules">签名规则</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table class="object-td-left">
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>requestTime</td>
                                                                            <td>String(24)</td>
                                                                            <td>M</td>
                                                                            <td langkey="request_times_des" data-html="true">
                                                                                发起请求时间，使用UTC时间（UTC +0）<br>
                                                                                格式（yyyy-MM-dd'T'HH:mm:ss.SSS'Z'）<br>例：2023-04-06T12:30:30.500Z
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_unique_identify">支付系统提供给合作商户的唯一标识</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantOrderId</td>
                                                                            <td>String(50)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_order_unique">商户系统内部的订单号,50个字符内、可包含字母, 确保在商户系统唯一</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>amount</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="dk_order_amounts_des" data-html="true">货币单位为对应国家的货币，小数两位</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>countryCode</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td langkey="country_codes_des">机构所在国家代码</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>currency</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="currency_des">货币代码详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>notificationUrl</td>
                                                                            <td>String(200)</td>
                                                                            <td>O</td>
                                                                            <td langkey="pay_notify_address_des">支付完成后结果异步通知 url</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>language</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="language_name_des">语言详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>inquiryToken</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>description</td>
                                                                            <td>String(200)</td>
                                                                            <td>O</td>
                                                                            <td langkey="field_remark_des"></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>+benificiaryAccountInfo</td>
                                                                            <td>Object</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_card_info_des">收款人的账户信息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「number</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_number_des">收款人所在机构(银行)帐号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_id_des">收款人机构(银行)ID, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgCode</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_code_des">收款人机构(银行)编码, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgName</td>
                                                                            <td>String(45)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="p_org_name_des">收款人所在机构(银行)名称, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「holderName</td>
                                                                            <td>String(200)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_holder_name_des">收款人所在机构(银行)户名</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalId</td>
                                                                            <td>String(12)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_id_des">收款人的证件号, 参考</span>
                                                                                <a href="#item-8" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_id">证件号</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalType</td>
                                                                            <td>String(10)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_type_des">收款人的证件类型, 参考</span>
                                                                                <a href="#item-9" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_type">证件类型</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「accountType</td>
                                                                            <td>String(10)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_acc_type_des">收款人的账户类型, 参考</span>
                                                                                <a href="#item-10" class="text-decoration-underline">
                                                                                    "<span langkey="org_acc_type">账户类型</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>+cardHolderInfo</td>
                                                                            <td>Object</td>
                                                                            <td>M</td>
                                                                            <td langkey="card_holder_info_des"></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「firstName</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="card_first_name_des">收款人first name，不能区分时，传姓名即可</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「lastName</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="card_last_name_des">收款人last name，不能区分时，传姓名即可</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「email</td>
                                                                            <td>String(45)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="customer_email_des" data-html="true"></span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「country</td>
                                                                            <td>String(64)</td>
                                                                            <td>O</td>
                                                                            <td langkey="card_country_name">持卡人的国家</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「city</td>
                                                                            <td>String(20)</td>
                                                                            <td>O</td>
                                                                            <td langkey="card_city_des">持卡人的所在城市</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「zip</td>
                                                                            <td>String(32)</td>
                                                                            <td>O</td>
                                                                            <td langkey="card_zip_code_des">持卡人的所在城市邮政编码</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「address</td>
                                                                            <td>String(200)</td>
                                                                            <td>O</td>
                                                                            <td langkey="card_address_des">持卡人的地址</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「phone</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="card_phone_des">持卡人的手机号码</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3" id="item-2-2-2">
                                                                <span langkey="response_params">响应参数</span>
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="response_sign_001">根据PAYOK返回的响应Body生成的签名；</span>
                                                                                <br>
                                                                                <span langkey="response_sign_002">接收到的签名请使用PAYOK公钥验签</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table class="object-td-left">
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>code</td>
                                                                            <td>String(1)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                SUCCESS：<span langkey="req_code_success">请求成功</span>
                                                                                ； FAIL：<span langkey="req_code_fail">请求失败</span>
                                                                                <span langkey="code_fail_des">具体错误原因可见字段: message</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>message</td>
                                                                            <td>String(128)</td>
                                                                            <td>O</td>
                                                                            <td langkey="response_code_err_des">当code返回FAIL时会返回详细的错误消息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td colspan="6" class="text-th" langkey="return_code_success" style="text-align:center!important">以下字段在code为SUCCESS时才有返回</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_des">PAYOK提供给合作方的商户唯一标识</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantOrderId</td>
                                                                            <td>String(50)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_order_unique">商户系统内部的订单号,50个字符内、可包含字母, 确保在商户系统唯一</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>platformOrderId</td>
                                                                            <td>String(32)</td>
                                                                            <td>O</td>
                                                                            <td langkey="platform_order_nos">PAYOK 订单号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>amount</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="dk_order_amounts_des" data-html="true">货币单位为对应国家的货币，小数两位</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>countryCode</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td langkey="country_codes_des">机构所在国家代码</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>currency</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="currency_des">货币代码详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>language</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="language_name_des">语言详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>status</td>
                                                                            <td>String(7)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                PENDING：<span langkey="code_pending">处理中</span>
                                                                                <br>
                                                                                FAILED： <span langkey="code_fail">失败</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>+benificiaryAccountInfo</td>
                                                                            <td>Object</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_card_info_des">收款人的账户信息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「number</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_number_des">收款人所在机构(银行)帐号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_id_des">收款人机构(银行)ID, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgCode</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_code_des">收款人机构(银行)编码, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgName</td>
                                                                            <td>String(45)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="p_org_name_des">收款人所在机构(银行)名称, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「holderName</td>
                                                                            <td>String(200)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_holder_name_des">收款人所在机构(银行)户名</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalId</td>
                                                                            <td>String(12)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_id_des">收款人的证件号, 参考</span>
                                                                                <a href="#item-8" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_id">证件号</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalType</td>
                                                                            <td>String(10)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_type_des">收款人的证件类型, 参考</span>
                                                                                <a href="#item-9" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_type">证件类型</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「accountType</td>
                                                                            <td>String(10)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_acc_type_des">收款人的账户类型, 参考</span>
                                                                                <a href="#item-10" class="text-decoration-underline">
                                                                                    "<span langkey="org_acc_type">账户类型</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>transFeeRate</td>
                                                                            <td>Decimal(6,5)</td>
                                                                            <td>M</td>
                                                                            <td langkey="trans_rate_des">交易费率,支持五位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>transFee</td>
                                                                            <td>Decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="trans_fee_des">单笔手续费,支持两位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>totalTransFee</td>
                                                                            <td>Decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="total_trans_fee_des">交易总手续费率,支持两位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>inquiryToken</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3" id="item-2-2-3">
                                                                <span langkey="example_params">示例</span>
                                                            </p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-2">
                                                                    <span langkey="send_request">请求参数</span>
                                                                </p>
                                                                <div>
                                                                    <div class="code-wrapper">
                                                                        <pre style="white-space:pre">
                                                                            <code>
                                                                                <span>
                                                                                    <span class="code-key">curl --location 'https://api-domian.com/api-pay/remit/V3.5/order/create' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'sign: </span>
                                                                                    <span class="code-val">kzkRGFNtRk0qIUGeiO1RQ+wLMVuiccaj9I1KVqhFbDenvrIVvjFqY0dy33mbwADAQ84o8aNAR0u73kZ7ZIuzROpMn0v++9D03UkGFgqAs8QiADwTEhbJbJ8RkNgkG4wzB2UYtzuCwOW4PNQZKxdQ1TXeg5jF51UIGywaL27SLx9k9JK3jjTQ30OnhYSOnvmQEO8xdfBp18NDswZdfxm+bAkF4O1ijI32Jl2vqAO6kO2MniFBH2M8JIviwVcSgP0wJZan1msPhwHCqgXvCYgrWNLrWRdljO33c0LFe+rB1VJT6bwnsOzyGq6lFvRT0zpVAMqzoiVeWKaD9Q3bAn51Aw==' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'Content-Type: application/json' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--data '{</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"requestTime"</span>
                                                                                    :<span class="code-val">"2024-06-27T08:42:21.657Z"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"notificationUrl"</span>
                                                                                    :<span class="code-val">"http://merchant-api.com/test/notify/20240627164210123/DK_PAY/6"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"inquiryToken"</span>
                                                                                    :<span class="code-val">"2024062709590000008"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"amount"</span>
                                                                                    :<span class="code-val">"20000.00"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"benificiaryAccountInfo"</span>
                                                                                    :{
                                                                                    <span class="code-val">
                                                                                        <span class="code-key">"number"</span>
                                                                                        :<span class="code-val">"0000000001"</span>
                                                                                        ,
      <span class="code-key">"holderName"</span>
                                                                                        :<span class="code-val">"Test"</span>
                                                                                        ,
      <span class="code-key">"orgName"</span>
                                                                                        :<span class="code-val">"Bank BCA"</span>
                                                                                        ,
      <span class="code-key">"orgCode"</span>
                                                                                        :<span class="code-val">"CENAIDJA"</span>
                                                                                        ,
      <span class="code-key">"orgId"</span>
                                                                                        :<span class="code-val">"014"</span>
                                                                                    </span>
                                                                                    },
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantId"</span>
                                                                                    :<span class="code-val">"010095"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"countryCode"</span>
                                                                                    :<span class="code-val">"IDN"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"description"</span>
                                                                                    :<span class="code-val">"Transfering Test"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"currency"</span>
                                                                                    :<span class="code-val">"Rp"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"language"</span>
                                                                                    :<span class="code-val">"EN"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"cardHolderInfo"</span>
                                                                                    :{
                                                                                    <span class="code-val">
                                                                                        <span class="code-key">"zip"</span>
                                                                                        :<span class="code-val">"123456"</span>
                                                                                        ,
      <span class="code-key">"firstName"</span>
                                                                                        :<span class="code-val">"John"</span>
                                                                                        ,
      <span class="code-key">"lastName"</span>
                                                                                        :<span class="code-val">"Don"</span>
                                                                                        ,
      <span class="code-key">"country"</span>
                                                                                        :<span class="code-val">"Indonesia"</span>
                                                                                        ,
      <span class="code-key">"address"</span>
                                                                                        :<span class="code-val">"Merchant Address"</span>
                                                                                        ,
      <span class="code-key">"city"</span>
                                                                                        :<span class="code-val">"Jakarta"</span>
                                                                                        ,
      <span class="code-key">"phone"</span>
                                                                                        :<span class="code-val">"223345678"</span>
                                                                                        ,
      <span class="code-key">"email"</span>
                                                                                        :
                                                                                        <span class="code-val">
                                                                                            "<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="2f5b4a5c5b6f5f4e564044014c4042">[email &#160;protected]</a>
                                                                                            "
                                                                                        </span>
                                                                                    </span>
                                                                                    },
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantOrderId"</span>
                                                                                    :<span class="code-val">"6010095DK_PAY1719477741656"</span>
                                                                                </span>
                                                                                <span>}'</span>
                                                                            </code>
                                                                        </pre>
                                                                        <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                        <div class="fa fa-clone">
                                                                            <img src="./public/images/copy.png" width="8%">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p class="c-3">
                                                                    <span langkey="response_params">响应参数</span>
                                                                </p>
                                                                <p class="c-3">Header:</p>
                                                                <div class="code-wrapper code-header">
                                                                    <pre style="white-space:pre">
                                                                        <code>
                                                                            <span>
                                                                                <span class="code-key">sign</span>
                                                                                :<span class="code-val">TBBwfE41vhmqZQBIG/CL++nKD+HbyMMzIBVCMUdrpDBnN++y8h78Jya6TRegHuoJCezj2/zrTy81nqdIe3SSzlqssKVfj0SE4YHKnnb3t30ypd2xRT5v0Xk9ek1BuxgBw9UDXjug+6QyS16mQz1E4Z+bTBd3u9kcK+Z+35RhgQOiEFgFLQk6gz3nr1wx8MWyS4/S9ke9EI7+op1rWMYTd7hJhzIQKT6J2smq/05fjK7uTexB45gfue5zesvU1Ftv93QyhebcXvBFVjnEchVxTLJtdzjsl5M0ZZN40ZJ96jJ5dO9NfimZ4dDNV61SpbIs6Kqgwy0jcM/dpw/fB7fN/Q==</span>
                                                                            </span>
                                                                        </code>
                                                                    </pre>
                                                                    <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                    <div class="fa fa-clone">
                                                                        <img src="./public/images/copy.png" width="8%">
                                                                    </div>
                                                                </div>
                                                                <p class="c-3">Body:</p>
                                                                <div class="code-wrapper">
                                                                    <pre style="white-space:pre">
                                                                        <code>
                                                                            <span>{</span>
                                                                            <span>
                                                                                <span class="code-key">"amount"</span>
                                                                                :<span class="code-val">"20000.00"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"transFeeRate"</span>
                                                                                :<span class="code-val">0.03000</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"code"</span>
                                                                                :<span class="code-val">"SUCCESS"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"transFee"</span>
                                                                                :<span class="code-val">1000</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"totalTransFee"</span>
                                                                                :<span class="code-val">1600</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"language"</span>
                                                                                :<span class="code-val">"EN"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"merchantOrderId"</span>
                                                                                :<span class="code-val">"6010095DK_PAY1719477741656"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"message"</span>
                                                                                :<span class="code-val">"SUCCESS"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"inquiryToken"</span>
                                                                                :<span class="code-val">"2024062709590000008"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"benificiaryAccountInfo"</span>
                                                                                :{
                                                                                <span class="code-val">
                                                                                    <span class="code-key">"number"</span>
                                                                                    :<span class="code-val">"0000000001"</span>
                                                                                    ,
      <span class="code-key">"holderName"</span>
                                                                                    :<span class="code-val">"Test"</span>
                                                                                    ,
      <span class="code-key">"orgName"</span>
                                                                                    :<span class="code-val">"Bank BCA"</span>
                                                                                    ,
      <span class="code-key">"orgCode"</span>
                                                                                    :<span class="code-val">"CENAIDJA"</span>
                                                                                    ,
      <span class="code-key">"orgId"</span>
                                                                                    :<span class="code-val">"014"</span>
                                                                                </span>
                                                                                },
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"merchantId"</span>
                                                                                :<span class="code-val">"010095"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"countryCode"</span>
                                                                                :<span class="code-val">"IDN"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"currency"</span>
                                                                                :<span class="code-val">"Rp"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"status"</span>
                                                                                :<span class="code-val">"PENDING"</span>
                                                                            </span>
                                                                            <span>}</span>
                                                                        </code>
                                                                    </pre>
                                                                    <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                    <div class="fa fa-clone">
                                                                        <img src="./public/images/copy.png" width="8%">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p class="c-1" id="item-2-3" langkey="payout_order_query">代付订单查询</p>
                                                            <p class="c-3" id="item-2-3-1">
                                                                <span langkey="request_params">请求参数</span>
                                                            </p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-3">
                                                                    <span langkey="api_address">接口地址</span>
                                                                    ： <a href="#item-1-4" class="text-decoration-underline" langkey="click_api_lists">查看“接口说明”</a>
                                                                </p>
                                                            </div>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="rules_details_check">签名规则：详情查看</span>
                                                                                <a href="#item-1-3" class="text-decoration-underline text-red">
                                                                                    "<span langkey="signature_rules">签名规则</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>requestTime</td>
                                                                            <td>String(24)</td>
                                                                            <td>M</td>
                                                                            <td langkey="request_times_des" data-html="true">
                                                                                发起请求时间，使用UTC时间（UTC +0）<br>
                                                                                格式（yyyy-MM-dd'T'HH:mm:ss.SSS'Z'）<br>例：2023-04-06T12:30:30.500Z
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_des">PAYOK提供给合作方的商户唯一标识</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantOrderId</td>
                                                                            <td>String(50)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_order_unique">商户系统内部的订单号,50个字符内、可包含字母, 确保在商户系统唯一</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3" id="item-2-3-2">
                                                                <span langkey="response_params">响应参数</span>
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="response_sign_001">根据PAYOK返回的响应Body生成的签名；</span>
                                                                                <br>
                                                                                <span langkey="response_sign_002">接收到的签名请使用PAYOK公钥验签</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table class="object-td-left">
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>code</td>
                                                                            <td>String(1)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                SUCCESS：<span langkey="req_code_success">请求成功</span>
                                                                                ； FAIL：<span langkey="req_code_fail">请求失败</span>
                                                                                <span langkey="code_fail_des">具体错误原因可见字段: message</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>message</td>
                                                                            <td>String(128)</td>
                                                                            <td>O</td>
                                                                            <td langkey="response_code_err_des">当code返回FAIL时会返回详细的错误消息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td colspan="6" class="text-th" langkey="return_code_success" style="text-align:center!important">以下字段在code为SUCCESS时才有返回</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_des">PAYOK提供给合作方的商户唯一标识</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantOrderId</td>
                                                                            <td>String(50)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_order_unique">商户系统内部的订单号,50个字符内、可包含字母, 确保在商户系统唯一</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>platformOrderId</td>
                                                                            <td>String(32)</td>
                                                                            <td>O</td>
                                                                            <td langkey="platform_order_number">PAYOK 单号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>amount</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="dk_order_amounts_des" data-html="true">货币单位为对应国家的货币，小数两位</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>countryCode</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td langkey="country_codes_des">机构所在国家代码</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>currency</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="currency_des">货币代码详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>language</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="language_name_des">语言详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>status</td>
                                                                            <td>String(7)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                PENDING：<span langkey="code_pending">处理中</span>
                                                                                <span langkey="wait_bank_result">（需要等银行更新最终结果）</span>
                                                                                <br>
                                                                                SUCCESS：<span langkey="code_success">成功</span>
                                                                                <br>
                                                                                FAILED： <span langkey="code_fail">失败</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>createTime</td>
                                                                            <td>String(16)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="date_format_des">yyyyMMddHHmmss</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>successTime</td>
                                                                            <td>String(16)</td>
                                                                            <td>O</td>
                                                                            <td>
                                                                                <span langkey="date_format_des">yyyyMMddHHmmss</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>+benificiaryAccountInfo</td>
                                                                            <td>Object</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_card_info_des">收款人的账户信息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「number</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_number_des">收款人所在机构(银行)帐号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_id_des">收款人机构(银行)ID, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgCode</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_code_des">收款人机构(银行)编码, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgName</td>
                                                                            <td>String(45)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="p_org_name_des">收款人所在机构(银行)名称, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「holderName</td>
                                                                            <td>String(200)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_holder_name_des">收款人所在机构(银行)户名</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalId</td>
                                                                            <td>String(12)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_id_des">收款人的证件号, 参考</span>
                                                                                <a href="#item-8" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_id">证件号</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>transFeeRate</td>
                                                                            <td>Decimal(6,5)</td>
                                                                            <td>M</td>
                                                                            <td langkey="trans_rate_des">交易费率,支持五位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>transFee</td>
                                                                            <td>Decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="trans_fee_des">单笔手续费,支持两位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>totalTransFee</td>
                                                                            <td>Decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="total_trans_fee_des">交易总手续费率,支持两位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>voucherNo</td>
                                                                            <td>String(50)</td>
                                                                            <td>O</td>
                                                                            <td>
                                                                                <span langkey="payout_voucher_no_des">付款凭证号，根据不同的国家会返回不同的内容；详细查看 </span>
                                                                                <a href="#item-2-5" class="text-decoration-underline">"voucherNo"</a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3" id="item-2-3-3">
                                                                <span langkey="example_params">示例</span>
                                                            </p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-2">
                                                                    <span langkey="request_params">请求参数</span>
                                                                </p>
                                                                <div>
                                                                    <div class="code-wrapper">
                                                                        <pre style="white-space:pre">
                                                                            <code>
                                                                                <span>
                                                                                    <span class="code-key">curl --location 'https://api-domian.com/api-pay/remit/V3.5/order/query' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'Content-Type: application/json' </span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'sign:</span>
                                                                                    <span class="code-val">0WS8ioJ0YfKRzRqilKGntWs4b8baqC7O2t/NSI29Z7aNmO6No7OcTgZfc9ZOALjKBAtrsCf5jQWGEbNZZBGpicETLL/rg1C+N3N8aKNhKV7AAVlWcEmtJoDgaVmwAwT7hoKsKkO3sU9NE33uyiXUrRupsgyRwF5ki3SzdBd5jxd63Pb5bvitnADxp3hYqUIgkLYvj9aactpJ6GH5h+oyvriUWh5FtZlGjIhqTvc7LJmcJOCC4qlrvGC8tPYmS5cfIjVManMfyw7q36HBcmiCnz+prmpiE5qiAbLRHbzI6MnKrUIu4ScKm44zEZ6wGDrcCwaPQko0FZxJsLeru1iiVg==' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--data '{</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"requestTime"</span>
                                                                                    :<span class="code-val">"2024-06-27T08:42:27.355Z"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantId"</span>
                                                                                    :<span class="code-val">"010095"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantOrderId"</span>
                                                                                    :<span class="code-val">"6010095DK_PAY1719477741656"</span>
                                                                                </span>
                                                                                <span>}'</span>
                                                                            </code>
                                                                        </pre>
                                                                        <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                        <div class="fa fa-clone">
                                                                            <img src="./public/images/copy.png" width="8%">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p class="c-3">
                                                                    <span langkey="response_results">响应结果</span>
                                                                </p>
                                                                <p class="c-3">Header:</p>
                                                                <div class="code-wrapper code-header">
                                                                    <pre style="white-space:pre">
                                                                        <code>
                                                                            <span>
                                                                                <span class="code-key">sign</span>
                                                                                :<span class="code-val">j5GfDOcU1kMiK4Es5+BNgYClx9y7g4M1H1GRja3bJO5/zRgZlGaxD3z8fgr2xxnXtvgGdI33BF2syK/XWJ/Kxee+AhkFPUKfrz3Kh+pr+XQY1L0QlEY837sbnROKOXzORho4SN05HMRK2S/C7Xc77wV+77dFWtZNLcABFmyoWYJQtB3SfF4NFkCtHw5CwwukW1i4OqKIzF40qOizUg8/sy+S0EVYPhBtKLRkqG2K+/F2Elrard93RoI9usi6MbGp41d6ZK9sh82o5+x2NQHosSeECXs++eVnH0xGfFOY2sKlKWFT13oeTxyCLwLliSwz/mhupz8kMWAAlY7o7XoyDA==</span>
                                                                            </span>
                                                                        </code>
                                                                    </pre>
                                                                    <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                    <div class="fa fa-clone">
                                                                        <img src="./public/images/copy.png" width="8%">
                                                                    </div>
                                                                </div>
                                                                <p class="c-3">Body:</p>
                                                                <div class="code-wrapper">
                                                                    <pre style="white-space:pre">
                                                                        <code>
                                                                            <span>{</span>
                                                                            <span>
                                                                                <span class="code-key">"amount"</span>
                                                                                :<span class="code-val">20000</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"transFeeRate"</span>
                                                                                :<span class="code-val">0.03000</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"code"</span>
                                                                                :<span class="code-val">"SUCCESS"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"transFee"</span>
                                                                                :<span class="code-val">1000</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"totalTransFee"</span>
                                                                                :<span class="code-val">1600</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"language"</span>
                                                                                :<span class="code-val">"ID"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"merchantOrderId"</span>
                                                                                :<span class="code-val">"6010095DK_PAY1719477741656"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"message"</span>
                                                                                :<span class="code-val">"SUCCESS"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"benificiaryAccountInfo"</span>
                                                                                :{
                                                                                <span class="code-val">
                                                                                    <span class="code-key">"number"</span>
                                                                                    :<span class="code-val">"0000000001"</span>
                                                                                    ,
      <span class="code-key">"holderName"</span>
                                                                                    :<span class="code-val">"Test"</span>
                                                                                    ,
      <span class="code-key">"orgName"</span>
                                                                                    :<span class="code-val">"Bank BCA"</span>
                                                                                    ,
      <span class="code-key">"orgCode"</span>
                                                                                    :<span class="code-val">"CENAIDJA"</span>
                                                                                    ,
      <span class="code-key">"orgId"</span>
                                                                                    :<span class="code-val">"014"</span>
                                                                                </span>
                                                                                },
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"merchantId"</span>
                                                                                :<span class="code-val">"010095"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"createTime"</span>
                                                                                :<span class="code-val">"20240627154222"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"countryCode"</span>
                                                                                :<span class="code-val">"IDN"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"currency"</span>
                                                                                :<span class="code-val">"Rp"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"platformOrderId"</span>
                                                                                :<span class="code-val">"2024062709590000008"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"status"</span>
                                                                                :<span class="code-val">"PENDING"</span>
                                                                            </span>
                                                                            <span>}</span>
                                                                        </code>
                                                                    </pre>
                                                                    <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                    <div class="fa fa-clone">
                                                                        <img src="./public/images/copy.png" width="8%">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p class="c-1" id="item-2-4" langkey="payout_async_callback">代付异步回调通知</p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-2 text-red" langkey="post_send_request">服务方通过POST请求json参数的方式发起请求。</p>
                                                                <p class="c-2">
                                                                    <span langkey="re_notice_interval">收到PAYOK通知后请返回SUCCESS,否则PAYOK会每隔一段时间通知一次（一共通知6次）。</span>
                                                                    <span langkey="re_notice_interval_times">通知的间隔时间依次为2S 5S 10S 30S 60S 900S</span>
                                                                </p>
                                                            </div>
                                                            <p class="c-3" id="item-2-4-1">
                                                                <span langkey="response_params">响应参数</span>
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="response_sign_001">根据PAYOK返回的响应Body生成的签名；</span>
                                                                                <br>
                                                                                <span langkey="response_sign_002">接收到的签名请使用PAYOK公钥验签</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table class="object-td-left">
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>code</td>
                                                                            <td>String(1)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                SUCCESS：<span langkey="req_code_success">请求成功</span>
                                                                                ； FAIL：<span langkey="req_code_fail">请求失败</span>
                                                                                <span langkey="code_fail_des">具体错误原因可见字段: message</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>message</td>
                                                                            <td>String(128)</td>
                                                                            <td>O</td>
                                                                            <td langkey="response_code_err_des">当code返回FAIL时会返回详细的错误消息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td colspan="6" class="text-th" langkey="return_code_success" style="text-align:center!important">以下字段在code为SUCCESS时才有返回</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_des">PAYOK提供给合作方的商户唯一标识</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantOrderId</td>
                                                                            <td>String(50)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_order_unique">商户系统内部的订单号,50个字符内、可包含字母, 确保在商户系统唯一</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>platformOrderId</td>
                                                                            <td>String(32)</td>
                                                                            <td>O</td>
                                                                            <td langkey="platform_order_number">PAYOK 单号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>amount</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="dk_order_amounts_des" data-html="true">货币单位为对应国家的货币，小数两位</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>countryCode</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td langkey="country_codes_des">机构所在国家编码</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>currency</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="currency_des">货币代码详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>language</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="language_name_des">语言详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>status</td>
                                                                            <td>String(7)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                SUCCESS：<span langkey="code_success">成功</span>
                                                                                FAILED：<span langkey="code_fail">失败</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>createTime</td>
                                                                            <td>String(16)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="date_format_des">yyyyMMddHHmmss</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>successTime</td>
                                                                            <td>String(16)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="date_format_des">yyyyMMddHHmmss</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>+benificiaryAccountInfo</td>
                                                                            <td>Object</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_card_info_des">收款人的账户信息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「number</td>
                                                                            <td>String(30)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_number_des">收款人所在机构(银行)帐号</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_id_des">收款人机构(银行)ID, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgCode</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="org_code_des">收款人机构(银行)编码, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「orgName</td>
                                                                            <td>String(45)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="p_org_name_des">收款人所在机构(银行)名称, 参考</span>
                                                                                <a href="#item-6" class="text-decoration-underline">
                                                                                    "<span langkey="org_bank_list">机构(银行)列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「holderName</td>
                                                                            <td>String(200)</td>
                                                                            <td>M</td>
                                                                            <td langkey="org_holder_name_des">收款人所在机构(银行)户名</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td class="object-child">「personalId</td>
                                                                            <td>String(12)</td>
                                                                            <td>C</td>
                                                                            <td>
                                                                                <span langkey="org_personal_id_des">收款人的证件号, 参考</span>
                                                                                <a href="#item-8" class="text-decoration-underline">
                                                                                    "<span langkey="org_personal_id">证件号</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>transFeeRate</td>
                                                                            <td>Decimal(6,5)</td>
                                                                            <td>M</td>
                                                                            <td langkey="trans_rate_des">交易费率,支持五位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>transFee</td>
                                                                            <td>Decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="trans_fee_des">单笔手续费,支持两位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>totalTransFee</td>
                                                                            <td>Decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="total_trans_fee_des">交易总手续费率,支持两位小数</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>voucherNo</td>
                                                                            <td>String(50)</td>
                                                                            <td>O</td>
                                                                            <td>
                                                                                <span langkey="payout_voucher_no_des">付款凭证号，根据不同的国家会返回不同的内容；详细查看 </span>
                                                                                <a href="#item-2-5" class="text-decoration-underline">"voucherNo"</a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3" id="item-2-4-3">
                                                                <span langkey="example_params">示例</span>
                                                                <br>
                                                                <span langkey="with_signature" data-html="true">（带签名）</span>
                                                            </p>
                                                            <div class="sectionOnePage">
                                                                <div>
                                                                    <div class="code-wrapper">
                                                                        <pre style="white-space:pre">
                                                                            <code>
                                                                                <span>
                                                                                    <span class="code-key">curl --location 'http://merchant-api.com/test/notify/20240627164210123/DK_PAY/6' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'sign: </span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-val">icasJ9/ma0JiaenQAAnFFJHyJXcr7FY2Ysz/C08eSNvYBgRf52cWCP0/80hwkSi1zMS4nwOWDn9WzUI85h5UpJJOaz0v5DJ17dtgFDAukHrBnlQoIKwD4YogwyokGCiZo+wUWHyMpqX+KnBw73L9lSlc6fAJs5VlJQCuQnTNjNpPJNVBmle7IKtV7L7DZkYlpXzKAQtollId1RsR1nkUokdhgoCheS5NuqetKAuYH/yHhsYx8YLZDjGTkz7Uad1hwqztZXK9aOk9GpA3r/BXGJSaqk+YKKUopjBurSQ7Sc8sACMRPAtFYIRKxUYTOHgIgDxva9vJKQ4z6SjZvNvj/Q==' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'Content-Type: application/json' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--data '{</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"amount"</span>
                                                                                    :<span class="code-val">20000</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"transFeeRate"</span>
                                                                                    :<span class="code-val">0.03000</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"code"</span>
                                                                                    :<span class="code-val">"SUCCESS"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"transFee"</span>
                                                                                    :<span class="code-val">1000</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"totalTransFee"</span>
                                                                                    :<span class="code-val">1600</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"language"</span>
                                                                                    :<span class="code-val">"ID"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantOrderId"</span>
                                                                                    :<span class="code-val">"6010095DK_PAY1719477741656"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"message"</span>
                                                                                    :<span class="code-val">"SUCCESS"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"benificiaryAccountInfo"</span>
                                                                                    :{
                                                                                    <span class="code-val">
                                                                                        <span class="code-key">"number"</span>
                                                                                        :<span class="code-val">"0000000001"</span>
                                                                                        ,
      <span class="code-key">"holderName"</span>
                                                                                        :<span class="code-val">"Test"</span>
                                                                                        ,
      <span class="code-key">"orgName"</span>
                                                                                        :<span class="code-val">"Bank BCA"</span>
                                                                                        ,
      <span class="code-key">"orgCode"</span>
                                                                                        :<span class="code-val">"CENAIDJA"</span>
                                                                                        ,
      <span class="code-key">"orgId"</span>
                                                                                        :<span class="code-val">"014"</span>
                                                                                    </span>
                                                                                    },
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantId"</span>
                                                                                    :<span class="code-val">"010095"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"createTime"</span>
                                                                                    :<span class="code-val">"20240627154222"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"countryCode"</span>
                                                                                    :<span class="code-val">"IDN"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"currency"</span>
                                                                                    :<span class="code-val">"Rp"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"platformOrderId"</span>
                                                                                    :<span class="code-val">"2024062709590000008"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"status"</span>
                                                                                    :<span class="code-val">"SUCCESS"</span>
                                                                                </span>
                                                                                <span>}'</span>
                                                                            </code>
                                                                        </pre>
                                                                        <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                        <div class="fa fa-clone">
                                                                            <img src="./public/images/copy.png" width="8%">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p class="c-1" id="item-2-5" langkey="payout_voucher_no">付款凭证号</p>
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="country_name">国家</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="describe">描述</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td langkey="c_indonesia">印度尼西亚</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_vietnam">越南</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_brazil">巴西</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_thailand">泰国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_turkey">土耳其</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_colombia">哥伦比亚</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_india">印度</td>
                                                                            <td>Y</td>
                                                                            <td>UTR</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_bangladesh">孟加拉国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_south_korea">韩国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-3">
                                                        <div class="content guide-nv c-title" langkey="acc_balance_query">账户余额查询</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional">
                                                            <p class="c-3" langkey="request_params">请求参数</p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-3">
                                                                    <span langkey="api_address">接口地址</span>
                                                                    ： <a href="#item-1-4" class="text-decoration-underline" langkey="click_api_lists">查看“接口说明”</a>
                                                                </p>
                                                            </div>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="rules_details_check">签名规则：详情查看</span>
                                                                                <a href="#item-1-3" class="text-decoration-underline text-red">
                                                                                    "<span langkey="signature_rules">签名规则</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>requestTime</td>
                                                                            <td>String(24)</td>
                                                                            <td>M</td>
                                                                            <td langkey="request_times_des" data-html="true">
                                                                                发起请求时间，使用UTC时间（UTC +0）<br>
                                                                                格式（yyyy-MM-dd'T'HH:mm:ss.SSS'Z'）<br>例：2023-04-06T12:30:30.500Z
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_des">PAYOK提供给合作方的商户唯一标识</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3" id="item-3-1-2">
                                                                <span langkey="response_params">响应参数</span>
                                                            </p>
                                                            <div class="sectionOnePage scroll">
                                                                <p class="c-3">Header:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Content-Type</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="content_fixed">固定</span>
                                                                                ：application/json;charset=utf-8
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>sign</td>
                                                                            <td>String</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="response_sign_001">根据PAYOK返回的响应Body生成的签名；</span>
                                                                                <br>
                                                                                <span langkey="response_sign_002">接收到的签名请使用PAYOK公钥验签</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <p class="c-3">Body:</p>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="filed_variable">变量</th>
                                                                            <th langkey="filed_type">类型</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="filed_illustrate">说明</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>code</td>
                                                                            <td>String(1)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                SUCCESS：<span langkey="req_code_success">请求成功</span>
                                                                                ； FAIL：<span langkey="req_code_fail">请求失败</span>
                                                                                <span langkey="code_fail_des">具体错误原因可见字段: message</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>message</td>
                                                                            <td>String(128)</td>
                                                                            <td>O</td>
                                                                            <td langkey="response_code_err_des">当code返回FAIL时会返回详细的错误消息</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td colspan="6" class="text-th" langkey="return_code_success">以下字段在code为SUCCESS时才有返回</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>merchantId</td>
                                                                            <td>String(20)</td>
                                                                            <td>M</td>
                                                                            <td langkey="merchant_no_des">PAYOK提供给合作方的商户唯一标识</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>withdrawingBalance</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="withdrawing_balance_des">商户发起提现中的金额</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>availableBalance</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="available_balance_des">商户可用的金额</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>settlingBalance</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="setting_balance_des">代收订单成功但未结算给商户的金额</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>totalBalance</td>
                                                                            <td>decimal(12,2)</td>
                                                                            <td>M</td>
                                                                            <td langkey="total_balance_des">商户可用资金总和 = availableBalance+settlingBalance</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>currency</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="currency_des">货币代码详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>language</td>
                                                                            <td>String(4)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="language_name_des">语言详细可见</span>
                                                                                <a href="#item-5" class="text-decoration-underline">
                                                                                    "<span langkey="country_code_list">国家编码列表</span>
                                                                                    "
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>createTime</td>
                                                                            <td>String(16)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="date_format_des">yyyyMMddHHmmss</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>updateTime</td>
                                                                            <td>String(16)</td>
                                                                            <td>M</td>
                                                                            <td>
                                                                                <span langkey="date_format_des">yyyyMMddHHmmss</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p class="c-3">
                                                                <span langkey="example_params">示例</span>
                                                            </p>
                                                            <div class="sectionOnePage">
                                                                <p class="c-2">
                                                                    <span langkey="send_request">发送请求</span>
                                                                </p>
                                                                <div>
                                                                    <div class="code-wrapper">
                                                                        <pre style="white-space:pre">
                                                                            <code>
                                                                                <span>
                                                                                    <span class="code-key">curl --location 'http://payok-test.com/api-pay/remit/V3.5/balance/query' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'Content-Type: application/json' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--header 'sign:</span>
                                                                                    <span class="code-val">fCLJnDtlNcXjo2VGrJ6rSKg7fEWmHpcVyO2o1BDt5VpmZPNxvcP89ToUNqBTfhmE7Ns0SXKAGVenmh1ePFYaJrOAmwOVSlHq2HKAiooVqh1+zvLGLTnc3gEXh3Vz3CTK0BpHk+RDa24fmwRLjYeXtWifZwLoT88Jh1oG0DPX/ScwFfjEr96njuAokgFhnmoof8OksH6IEtoNazx7AKuHuGFQ0UvBC4GxAsJ8PWlJcKBc0E1+oFYkJHu08ROIRWaizTSubv+5am6w/iFxq3EYAEIBPzZEDqd9EjDfNWMXwCTfQrKfXqza3fO4WWXLKGAAZpUYgLCP9Dqa8xvS/lIFXQ==' \</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">--data '{</span>
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"requestTime"</span>
                                                                                    :<span class="code-val">"2024-06-27T09:28:19.557Z"</span>
                                                                                    ,
                                                                                </span>
                                                                                <span>
                                                                                    <span class="code-key">"merchantId"</span>
                                                                                    :<span class="code-val">"010095"</span>
                                                                                </span>
                                                                                <span>}'</span>
                                                                            </code>
                                                                        </pre>
                                                                        <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                        <div class="fa fa-clone">
                                                                            <img src="./public/images/copy.png" width="8%">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p class="c-3">
                                                                    <span langkey="return_results">返回结果</span>
                                                                </p>
                                                                <p class="c-3">Header:</p>
                                                                <div class="code-wrapper code-header">
                                                                    <pre style="white-space:pre">
                                                                        <code>
                                                                            <span>
                                                                                <span class="code-key">sign</span>
                                                                                :<span class="code-val">ZkY80Pvxjg9gsWkXB1+GU/AHJY3XPXkDr6qLH44RUG09uACyCq2RANibeMqyzz4RzHU/lNo3Pxl8fnIIgoipTmywfC0lRvZgiJn5Po4BalDfQsRe379RsnMj9UKuHnjGynWjoPtlxPp+/cw4kSMa6Bqpx+eB2wfhgam3dNKlcn4grOdiA/pq/KwcNFJDK/xIqtmHFnQ+tGGiBANlIDdZb69bG9nK9UULoaffcukCoSMLRJKDPwoHlODupyy+iZDl9/hzEoQS/A6py2Ik6b7YVrbZvvTzGp0q4sY6bSrMrQTOyBUEocIPJ3zRpT391UnCyadBNlGOKA7Jwj0sTxzbNQ==</span>
                                                                            </span>
                                                                        </code>
                                                                    </pre>
                                                                    <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                    <div class="fa fa-clone">
                                                                        <img src="./public/images/copy.png" width="8%">
                                                                    </div>
                                                                </div>
                                                                <p class="c-3">Body:</p>
                                                                <div class="code-wrapper">
                                                                    <pre style="white-space:pre">
                                                                        <code>
                                                                            <span>{</span>
                                                                            <span>
                                                                                <span class="code-key">"code"</span>
                                                                                :<span class="code-val">"SUCCESS"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"merchantId"</span>
                                                                                :<span class="code-val">"010095"</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"withdrawingBalance"</span>
                                                                                :<span class="code-val">121444303.32</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"availableBalance"</span>
                                                                                :<span class="code-val">99985049209.57</span>
                                                                                ,
                                                                            </span>
                                                                            <span>
                                                                                <span class="code-key">"settlingBalance"</span>
                                                                                :<span class="code-val">56907948.7</span>
                                                                            </span>
                                                                            <span>}</span>
                                                                        </code>
                                                                    </pre>
                                                                    <div class="copy-success fa-clone" hidden langkey="copy_success">复制成功</div>
                                                                    <div class="fa fa-clone">
                                                                        <img src="./public/images/copy.png" width="8%">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-4">
                                                        <div class="content guide-nv c-title" langkey="error_info_list">错误信息</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional" id="errorCodeMode">
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="error_no">序号</th>
                                                                            <th langkey="describe">描述</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>00</td>
                                                                            <td>signature error or merchant doesn't exist</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>01</td>
                                                                            <td>paramError:Non-POST JSON format parameter request</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>02</td>
                                                                            <td>paramError:invalid personal id</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>03</td>
                                                                            <td>paramError:personal id is null</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>04</td>
                                                                            <td>paramError:Bank card number cannot be empty</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>05</td>
                                                                            <td>paramError:requestTime is null</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>06</td>
                                                                            <td>paramError:requestTime non-UTC format</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>07</td>
                                                                            <td>paramError:invalid requestTime</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>08</td>
                                                                            <td>paramError:invalid callback notification address</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>09</td>
                                                                            <td>paramError:The Bank Code cannot be empty</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>10</td>
                                                                            <td>paramError:wrong bank card information, please check</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>11</td>
                                                                            <td>paramError:The outTradeNo cannot be empty</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>12</td>
                                                                            <td>paramError:The maximum length of the outTradeNo number is 50</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>13</td>
                                                                            <td>paramError:The idToken(inquiryToken) cannot be empty</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>14</td>
                                                                            <td>paramError:The maximum length of idToken(inquiryToken) is 30</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>15</td>
                                                                            <td>paramError:The Bank ID cannot be empty</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>16</td>
                                                                            <td>paramError:The Amount cannot be empty</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>17</td>
                                                                            <td>paramError:The personalType or AccountType cannot be empty</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>18</td>
                                                                            <td>paramError:invalid inquiry token</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>19</td>
                                                                            <td>paramError:invalid amount</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>20</td>
                                                                            <td>the single payout amount is greater than the maximum payout amount of the bank</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>21</td>
                                                                            <td>no available payout channel or unsupported bank code</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>22</td>
                                                                            <td>the amount is wrong and doesn't meet the range of the merchant's payout amount</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>23</td>
                                                                            <td>no available payout channel or unsupported bank code</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>24</td>
                                                                            <td>the amount is wrong and doesn't meet the range of the merchant's payout amount</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>25</td>
                                                                            <td>Merchant Account Balance Insufficient</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>26</td>
                                                                            <td>amount can not be null and must be greater than</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>27</td>
                                                                            <td>no available payout channel or channel not opened</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>28</td>
                                                                            <td>inquiry queries exceed the maximum number of requests</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>29</td>
                                                                            <td>blacklist user</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>30</td>
                                                                            <td>Non-whitelisted ip request</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>31</td>
                                                                            <td>Internal Server Error</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>32</td>
                                                                            <td>system anomaly</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>33</td>
                                                                            <td>order already exists</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-5">
                                                        <div class="content guide-nv c-title" langkey="country_code_list">国家编码列表</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional" id="paymentTypeMode">
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="country_name">国家</th>
                                                                            <th langkey="country_code_id">国家代码</th>
                                                                            <th langkey="currency_name">货币</th>
                                                                            <th langkey="language_name">语言</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td langkey="c_indonesia">印度尼西亚</td>
                                                                            <td>IDN</td>
                                                                            <td>Rp</td>
                                                                            <td>EN、ID</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_vietnam">越南</td>
                                                                            <td>VN</td>
                                                                            <td>VND</td>
                                                                            <td>EN、VIE</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_brazil">巴西</td>
                                                                            <td>BR</td>
                                                                            <td>BRL</td>
                                                                            <td>EN、POR</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_turkey">土耳其</td>
                                                                            <td>TR</td>
                                                                            <td>TRY</td>
                                                                            <td>EN、TUR</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_thailand">泰国</td>
                                                                            <td>TH</td>
                                                                            <td>THB</td>
                                                                            <td>EN、TH</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_colombia">哥伦比亚</td>
                                                                            <td>COL</td>
                                                                            <td>COP</td>
                                                                            <td>EN、ES</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_india">印度</td>
                                                                            <td>IN</td>
                                                                            <td>INR</td>
                                                                            <td>EN、HIN</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_bangladesh">孟加拉国</td>
                                                                            <td>BD</td>
                                                                            <td>BDT</td>
                                                                            <td>EN、BN</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_south_korea">韩国</td>
                                                                            <td>KR</td>
                                                                            <td>KRW</td>
                                                                            <td>EN、KOR</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-6">
                                                        <div class="content guide-nv c-title" langkey="org_bank_list">机构(银行)列表</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional">
                                                            <div class="sectionOnePage mt-4 mb-5">
                                                                <span class="c-1" langkey="details_view_bank">详细可查看：</span>
                                                                <a href="javascript:void(0);" class="text-decoration-underline font-16 pl-2" name="bank-list">
                                                                    <span langkey="re_bank_coding_appendix">机构(银行)编码附录</span>
                                                                </a>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-7">
                                                        <div class="content guide-nv c-title" langkey="single_limit_list">单笔限额列表</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional">
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="country_names">国家</th>
                                                                            <th langkey="payment_types">支付方式</th>
                                                                            <th langkey="c_min_limit">最小额度/单笔</th>
                                                                            <th langkey="c_max_limit">最大额度/单笔</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td rowspan="2">
                                                                                <span langkey="c_indonesia">印度尼西亚</span>
                                                                                (IDR)
                                                                            </td>
                                                                            <td langkey="payout_bank_account">代付到银行账户</td>
                                                                            <td>10,000</td>
                                                                            <td>50,000,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="payout_wallet_account">代付到钱包账号</td>
                                                                            <td>10,000</td>
                                                                            <td langkey="depends_on_wallet">取决于用户钱包额度</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td rowspan="2">
                                                                                <span langkey="c_vietnam">越南</span>
                                                                                (VND)
                                                                            </td>
                                                                            <td langkey="payout_bank_account">代付到银行账户</td>
                                                                            <td>50,000</td>
                                                                            <td>300,000,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="payout_wallet_account">代付到钱包账号</td>
                                                                            <td>20,000</td>
                                                                            <td>50,000,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <span langkey="c_brazil">巴西</span>
                                                                                (BRL)
                                                                            </td>
                                                                            <td>PIX</td>
                                                                            <td>10</td>
                                                                            <td>15,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <span langkey="c_thailand">泰国</span>
                                                                                (THB)
                                                                            </td>
                                                                            <td langkey="payout_bank_account">代付到银行账户</td>
                                                                            <td>300</td>
                                                                            <td>2,000,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <span langkey="c_turkey">土耳其</span>
                                                                                (TRY)
                                                                            </td>
                                                                            <td langkey="payout_bank_account">代付到银行账号</td>
                                                                            <td>1,000</td>
                                                                            <td>250,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <span langkey="c_colombia">哥伦比亚</span>
                                                                                (COP)
                                                                            </td>
                                                                            <td langkey="payout_bank_account_wallet">代付到钱包和银行账户</td>
                                                                            <td>50,000</td>
                                                                            <td>3,000,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <span langkey="c_india">印度</span>
                                                                                (INR)
                                                                            </td>
                                                                            <td langkey="payout_IFSC">代付到IFSC</td>
                                                                            <td>100</td>
                                                                            <td>50,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <span langkey="c_bangladesh">孟加拉国</span>
                                                                                (BDT)
                                                                            </td>
                                                                            <td langkey="payout_wallet_account">代付到钱包账号</td>
                                                                            <td>100</td>
                                                                            <td>25,000</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <span langkey="c_south_korea">韩国</span>
                                                                                (KRW)
                                                                            </td>
                                                                            <td langkey="payout_bank_account">代付到银行账户</td>
                                                                            <td>10,000</td>
                                                                            <td>9,000,000</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-8">
                                                        <div class="content guide-nv c-title" langkey="org_personal_id">证件号</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional" id="personalIdMode">
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="country_name">国家</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="describe">描述</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td langkey="c_indonesia">印度尼西亚</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_vietnam">越南</td>
                                                                            <td>Y</td>
                                                                            <td langkey="vn_personal_id_des">收款人的身份证，长度：9~12位</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_brazil">巴西</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_thailand">泰国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_turkey">土耳其</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_colombia">哥伦比亚</td>
                                                                            <td>Y</td>
                                                                            <td langkey="co_payment_card_des">收款人的身份证，长度：5~22位</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_india">印度</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_bangladesh">孟加拉国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_south_korea">韩国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-9">
                                                        <div class="content guide-nv c-title" langkey="org_personal_type">证件类型</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional" id="personalTypeMode">
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="country_name">国家</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="describe">描述</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td langkey="c_indonesia">印度尼西亚</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_vietnam">越南</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_brazil">巴西</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_thailand">泰国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_turkey">土耳其</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_colombia">哥伦比亚</td>
                                                                            <td>Y</td>
                                                                            <td>
                                                                                <span langkey="co_personal_id_des">顾客的身份证，长度：8~12位</span>
                                                                                <br>
                                                                                CC: <span langkey="cc_id_card">公民身份证</span>
                                                                                <br>
                                                                                CE: <span langkey="ce_id_card">外国人身份证</span>
                                                                                <br>
                                                                                TI: <span langkey="ti_id_card">未成年人身份证</span>
                                                                                <br>
                                                                                NIT: <span langkey="nit_id_card">纳税人识别号</span>
                                                                                <br>
                                                                                PA: <span langkey="pa_id_card">护照</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_india">印度</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_bangladesh">孟加拉国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_south_korea">韩国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <h4 id="item-10">
                                                        <div class="content guide-nv c-title" langkey="org_acc_type">账户类型</div>
                                                    </h4>
                                                    <div>
                                                        <section class="sectionOnePage sectional" id="accTypeMode" style="margin-bottom:430px">
                                                            <div class="sectionOnePage scroll">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th langkey="country_name">国家</th>
                                                                            <th langkey="filed_required">必填</th>
                                                                            <th langkey="describe">描述</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td langkey="c_indonesia">印度尼西亚</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_vietnam">越南</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_brazil">巴西</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_thailand">泰国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_turkey">土耳其</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_colombia">哥伦比亚</td>
                                                                            <td>Y</td>
                                                                            <td>
                                                                                0:<span langkey="acc_current">活期</span>
                                                                                &nbsp;1:<span langkey="acc_deposit">储蓄</span>
                                                                                &nbsp;2:<span langkey="acc_bre_b">Bre-B</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_india">印度</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_bangladesh">孟加拉国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td langkey="c_south_korea">韩国</td>
                                                                            <td>N</td>
                                                                            <td></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="btn-list">
                            <div class="opt-nav-sm" id="pageTop">
                                <img src="./public/images/top.png">
                            </div>
                            <div class="opt-nav-sm" id="showLeft">
                                <img src="./public/images/showLeft.svg" id="showNav">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
        <script src="js/runtime.e599120fd20da13abd6d.js?v=1779169592738&e599120fd20da13abd6d"></script>
        <script src="js/base.e599120fd20da13abd6d.js?v=1779169592738&e599120fd20da13abd6d"></script>
        <script src="js/vendor.e599120fd20da13abd6d.js?v=1779169592738&e599120fd20da13abd6d"></script>
        <script src="js/core.e599120fd20da13abd6d.js?v=1779169592738&e599120fd20da13abd6d"></script>
        <script src="js/payokdocumentpayoutdoc.e599120fd20da13abd6d.js?v=1779169592738&e599120fd20da13abd6d"></script>
        <script defer src="https://static.cloudflareinsights.com/beacon.min.js/v833ccba57c9e4d2798f2e76cebdd09a11778172276447" integrity="sha512-57MDmcccJXYtNnH+ZiBwzC4jb2rvgVCEokYN+L/nLlmO8rfYT/gIpW2A569iJ/3b+0UEasghjuZH/ma3wIs/EQ==" data-cf-beacon='{"version":"2024.11.0","token":"4188cf16840c46debd5f7ee73c573c9d","r":1,"server_timing":{"name":{"cfCacheStatus":true,"cfEdge":true,"cfExtPri":true,"cfL4":true,"cfOrigin":true,"cfSpeedBrain":true},"location_startswith":null}}' crossorigin="anonymous"></script>
    </body>
</html>
