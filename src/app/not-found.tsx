import {serverI18n} from '@/lib/server-i18n';
import {PublicFrame} from '@/components/PublicSite';
import './iavse-application.css';
export default async function NotFound(){const {t}=await serverI18n();return <PublicFrame path={['not-found']}><section className="iavse-not-found"><h1>{t('这一页，暂时不在这里。')}</h1><p>{t('内容可能尚未发布、已经下架，或地址有误。回到首页，继续逛逛吧。')}</p><a href="/" className="organic-button is-primary">{t('返回首页')}</a></section></PublicFrame>}
