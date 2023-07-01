SELECT 
  JSON_OBJECT(
      'name', 'users',
      'items', JSON_ARRAYAGG(
          JSON_OBJECT(
              'key', user_id,
              'username', username,
              'firstname', first_name,
              'last_name', last_name,
              'gender', gender
			 -- 'createdAt', CONCAT('new Date("', DATE_FORMAT(CONVERT_TZ(CREATED_DATE,'+5:30','+00:00'), '%Y-%m-%dT%T.000Z') , '")'), generate date like this it would directly insert as date in mongodb  
             -- 'modifiedAt', CONCAT('new Date("', DATE_FORMAT(CONVERT_TZ(MODIFIED_DATE,'+5:30','+00:00'), '%Y-%m-%dT%T.000Z') , '")')
			 -- for boolean add like this,  'active', CASE WHEN STATUS = 'ACTIVE' THEN 'true' ELSE 'false' END,
          )
      )
  )AS jsonData
FROM user_details 
@limit
