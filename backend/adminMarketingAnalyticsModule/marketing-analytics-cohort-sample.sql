WITH
      -- all_users for [date_range] period
      users AS (
        SELECT DISTINCT id, 
            DATETIME_TRUNC(
      DATETIME(
        TIMESTAMP_MILLIS(created), 
          'Asia/Jerusalem'
        ),
       DAY
    ) AS registrDate,
            UPPER(platform) AS platform,
            trafficSource
        FROM (SELECT
        * EXCEPT (rank)
      FROM (
        SELECT 
          * ,
          ROW_NUMBER() OVER(
            PARTITION BY id
            ORDER BY lastUpdated DESC
          ) rank 
        FROM `firebase_data.users`
        
      ) AS users_latest
      
      WHERE rank=1 AND (IFNULL(flags.isInternal,FALSE)=false AND created BETWEEN 1630443600000 AND 1633035599999))
      ),
      
      -- paying_users_per_day for [date_range + 365days] period
      paying_users_per_day AS (
      SELECT DISTINCT orders.userId AS userId, 
        SUM(orders.amountUsd) AS payments,
        SUM(orders.transactionFeesUsd) AS fees,
        DATETIME_TRUNC(
      DATETIME(
        TIMESTAMP_MILLIS(orders.paid), 
          'Asia/Jerusalem'
        ),
       DAY
    ) AS transDate 
      FROM (SELECT
        * EXCEPT (rank)
      FROM (
        SELECT 
          userId,paid,amountUsd,transactionFeesUsd,
          ROW_NUMBER() OVER(
            PARTITION BY id
            ORDER BY lastUpdated DESC
          ) rank 
        FROM `firebase_data.orders_daily`
        WHERE (_timestamp>=TIMESTAMP_MILLIS(1630443600000) AND _timestamp<=TIMESTAMP_MILLIS(1664571599999)) AND userId IN (SELECT id FROM users)
      ) AS orders_daily_latest
      
      WHERE rank=1 AND (paid IS NOT NULL)) AS orders
      GROUP BY transDate, userId
    ),
      
      -- sum_everybody_bought_per_date (and fee)
      aggregated_payments AS (
          SELECT
            FORMAT_DATETIME('%F', users.registrDate) AS date,
            FORMAT_DATETIME('%F', pay_u.transDate) AS transDate,
            platform,
            IF(trafficSource != 'FACEBOOK ADS' AND trafficSource != 'GOOGLEADWORDS_INT' AND trafficSource != 'BYTEDANCEGLOBAL_INT' AND trafficSource != 'APPLE SEARCH ADS' AND trafficSource != 'NONE (ORGANIC)', 'OTHERS', trafficSource) AS trafficSource,
            SUM(pay_u.payments) AS paymentsSum,
            SUM(pay_u.fees) AS feesSum,
            DATETIME_DIFF(pay_u.transDate, users.registrDate, DAY) AS day_number
          FROM paying_users_per_day AS pay_u
          LEFT JOIN users ON pay_u.userId = users.id
          GROUP BY users.registrDate, pay_u.transDate, platform, trafficSource
          ORDER BY users.registrDate, pay_u.transDate, platform, trafficSource
      ),
      
      -- sum of marketing costs
      aggregated_costs AS (
          SELECT
            platform,
            IF(mediaSource != 'FACEBOOK ADS' AND mediaSource != 'GOOGLEADWORDS_INT' AND mediaSource != 'BYTEDANCEGLOBAL_INT' AND mediaSource != 'APPLE SEARCH ADS' AND mediaSource != 'NONE (ORGANIC)', 'OTHERS', mediaSource) AS trafficSource,
            SUM(marketingCost) AS costSum
          FROM appsflyer_data.appsflyer_daily_costs
          WHERE timestamp BETWEEN 1630443600000 AND 1633035599999
          GROUP BY platform, trafficSource
          ORDER BY platform, trafficSource
      ),

      -- registrDate | transDate | platform | trafficSource | paymentsSum | feesSum | day_number | is_cohort_dayX
      matrix AS (
      SELECT
        data.*,     
        data.day_number <= 0 AS is_cohort_day0,
        data.day_number <= 1 AS is_cohort_day1,
        data.day_number <= 7 AS is_cohort_day7,
        data.day_number <= 30 AS is_cohort_day30,
        data.day_number <= 60 AS is_cohort_day60,
        data.day_number <= 180 AS is_cohort_day180,
        data.day_number <= 365 AS is_cohort_day365
      FROM aggregated_payments AS data
      )

      SELECT
        pay_d365.platform,
        pay_d365.trafficSource,
        ROUND(costSum, 2) AS adCostSum,    
        ROUND(pay_d0.paymentsSum, 2) AS paymentsD0,
        ROUND(pay_d1.paymentsSum, 2) AS paymentsD1,
        ROUND(pay_d7.paymentsSum, 2) AS paymentsD7,
        ROUND(pay_d30.paymentsSum, 2) AS paymentsD30,
        ROUND(pay_d60.paymentsSum, 2) AS paymentsD60,
        ROUND(pay_d180.paymentsSum, 2) AS paymentsD180,
        ROUND(pay_d365.paymentsSum, 2) AS paymentsD365
      FROM (SELECT platform, trafficSource, SUM(paymentsSum) AS paymentsSum FROM matrix WHERE is_cohort_day365 GROUP BY platform, trafficSource) AS pay_d365
      LEFT JOIN aggregated_costs AS costs USING (platform, trafficSource)       
      LEFT JOIN (SELECT platform, trafficSource, SUM(paymentsSum) AS paymentsSum FROM matrix WHERE is_cohort_day0 GROUP BY platform, trafficSource) AS pay_d0 USING (platform, trafficSource)
      LEFT JOIN (SELECT platform, trafficSource, SUM(paymentsSum) AS paymentsSum FROM matrix WHERE is_cohort_day1 GROUP BY platform, trafficSource) AS pay_d1 USING (platform, trafficSource)
      LEFT JOIN (SELECT platform, trafficSource, SUM(paymentsSum) AS paymentsSum FROM matrix WHERE is_cohort_day7 GROUP BY platform, trafficSource) AS pay_d7 USING (platform, trafficSource)
      LEFT JOIN (SELECT platform, trafficSource, SUM(paymentsSum) AS paymentsSum FROM matrix WHERE is_cohort_day30 GROUP BY platform, trafficSource) AS pay_d30 USING (platform, trafficSource)
      LEFT JOIN (SELECT platform, trafficSource, SUM(paymentsSum) AS paymentsSum FROM matrix WHERE is_cohort_day60 GROUP BY platform, trafficSource) AS pay_d60 USING (platform, trafficSource)
      LEFT JOIN (SELECT platform, trafficSource, SUM(paymentsSum) AS paymentsSum FROM matrix WHERE is_cohort_day180 GROUP BY platform, trafficSource) AS pay_d180 USING (platform, trafficSource)
      ORDER BY platform, trafficSource
